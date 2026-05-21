using Volo.Abp.Modularity;

namespace MessageApp;

/* Inherit from this class for your domain layer tests. */
public abstract class MessageAppDomainTestBase<TStartupModule> : MessageAppTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
