using System;
using Volo.Abp.Application.Dtos;

namespace MessageApp.Chat;

public class ChatChannelDto : EntityDto<Guid>
{
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime CreationTime { get; set; }
}
