using Volo.Abp.Modularity;

namespace MessageApp;

public abstract class MessageAppApplicationTestBase<TStartupModule> : MessageAppTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
