using Volo.Abp.Modularity;

namespace MessageApp;

[DependsOn(
    typeof(MessageAppDomainModule),
    typeof(MessageAppTestBaseModule)
)]
public class MessageAppDomainTestModule : AbpModule
{

}
