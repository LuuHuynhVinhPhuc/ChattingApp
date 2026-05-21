using System.ComponentModel.DataAnnotations;

namespace MessageApp.Chat;

public class CreateChatChannelDto
{
    [Required]
    [MaxLength(128)]
    public string Name { get; set; } = default!;

    [MaxLength(512)]
    public string? Description { get; set; }
}
