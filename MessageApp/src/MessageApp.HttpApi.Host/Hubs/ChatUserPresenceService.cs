using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Volo.Abp.DependencyInjection;

namespace MessageApp.Chat;

public class ChatUserPresenceService : IChatUserPresenceService, ISingletonDependency
{
    private readonly ConcurrentDictionary<Guid, string> _onlineUsers = new();

    public bool IsUserOnline(Guid userId)
    {
        return _onlineUsers.ContainsKey(userId);
    }

    public void AddUser(Guid userId, string connectionId)
    {
        _onlineUsers[userId] = connectionId;
    }

    public void RemoveUser(Guid userId)
    {
        _onlineUsers.TryRemove(userId, out _);
    }

    public List<Guid> GetOnlineUsers()
    {
        return [.. _onlineUsers.Keys];
    }
}
