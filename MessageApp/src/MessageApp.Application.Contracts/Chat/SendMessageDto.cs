using System;
using System.ComponentModel.DataAnnotations;

namespace MessageApp.Chat;

public class SendMessageDto
{
    public Guid? ReceiverId { get; set; }
    public Guid? ChannelId { get; set; }

    [Required]
    [MaxLength(2048)]
    public string Message { get; set; } = default!;
}
