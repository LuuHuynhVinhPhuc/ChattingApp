using System;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace MessageApp.Chat;

public class ChatDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<ChatChannel, Guid> _channelRepository;
    private readonly IGuidGenerator _guidGenerator;

    public ChatDataSeedContributor(
        IRepository<ChatChannel, Guid> channelRepository,
        IGuidGenerator guidGenerator)
    {
        _channelRepository = channelRepository;
        _guidGenerator = guidGenerator;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        if (await _channelRepository.GetCountAsync() > 0)
        {
            return;
        }

        await _channelRepository.InsertAsync(
            new ChatChannel(
                _guidGenerator.Create(),
                "General",
                "General discussion channel for everyone."
            )
        );

        await _channelRepository.InsertAsync(
            new ChatChannel(
                _guidGenerator.Create(),
                "Random",
                "Random thoughts and fun links."
            )
        );

        await _channelRepository.InsertAsync(
            new ChatChannel(
                _guidGenerator.Create(),
                "ABP Framework",
                "Discussion about ABP Backend development."
            )
        );

        await _channelRepository.InsertAsync(
            new ChatChannel(
                _guidGenerator.Create(),
                "React & Tailwind",
                "Frontend design, React component building, and CSS styling."
            )
        );
    }
}
