using System;
using Volo.Abp.Application.Dtos;

namespace MessageApp.Chat;

public class ChatMessageDto : EntityDto<Guid>
{
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = default!;
    public Guid? ReceiverId { get; set; }
    public Guid? ChannelId { get; set; }
    public string Message { get; set; } = default!;
    public DateTime CreationTime { get; set; }
}
