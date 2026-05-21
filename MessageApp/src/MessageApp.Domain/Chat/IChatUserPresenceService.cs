using System;

namespace MessageApp.Chat;

public interface IChatUserPresenceService
{
    bool IsUserOnline(Guid userId);
}
