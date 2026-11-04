using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlyAndStay.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Hotels",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Hotels",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Airports",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Airports",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Airports");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Airports");
        }
    }
}
