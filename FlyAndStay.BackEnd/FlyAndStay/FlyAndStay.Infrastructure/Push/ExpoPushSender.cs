using System.Net.Http.Headers;
using System.Net.Http.Json;
using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FlyAndStay.Infrastructure.Push;

public sealed class ExpoPushSender(HttpClient http, IOptions<ExpoPushSettings> options, ILogger<ExpoPushSender> logger) : IPushSender
{
    private const int BatchSize = 100;

    public async Task<List<PushDeliveryResult>> SendAsync(IReadOnlyList<PushMessage> messages, CancellationToken ct)
    {
        var settings = options.Value;
        var results = new List<PushDeliveryResult>();

        foreach (var batch in messages.Chunk(BatchSize))
        {
            var payload = batch
                .Select(m => new ExpoPushMessage { To = m.To, Title = m.Title, Body = m.Body, Data = m.Data })
                .ToList();

            using var request = new HttpRequestMessage(HttpMethod.Post, settings.SendUrl)
            {
                Content = JsonContent.Create(payload)
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            if (!string.IsNullOrWhiteSpace(settings.AccessToken))
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", settings.AccessToken);

            using var response = await http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Expo push service answered {Status}", (int)response.StatusCode);
                results.AddRange(batch.Select(m => new PushDeliveryResult(m.To, false, false)));
                continue;
            }

            var parsed = await response.Content.ReadFromJsonAsync<ExpoPushResponse>(ct);

            for (var i = 0; i < batch.Length; i++)
            {
                var ticket = parsed?.Data.ElementAtOrDefault(i);
                var delivered = ticket?.Status == "ok";
                var gone = ticket?.Details?.Error == "DeviceNotRegistered";

                if (!delivered && !gone)
                    logger.LogWarning("Expo push error for {Token}: {Message}", batch[i].To, ticket?.Message);

                results.Add(new PushDeliveryResult(batch[i].To, delivered, gone));
            }
        }

        return results;
    }
}
