using System;
using Volo.Abp.Application.Dtos;

namespace MessageApp.Chat;

public class ChatUserDto : EntityDto<Guid>
{
    public string UserName { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public bool IsOnline { get; set; }
}
