using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MessageApp.Migrations
{
    /// <inheritdoc />
    public partial class AddedChatChannelMembers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppChatChannelMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChannelId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppChatChannelMembers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppChatChannelMembers_ChannelId_UserId",
                table: "AppChatChannelMembers",
                columns: new[] { "ChannelId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppChatChannelMembers");
        }
    }
}
