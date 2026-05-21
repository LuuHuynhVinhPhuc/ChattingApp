using Microsoft.Extensions.Localization;
using MessageApp.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace MessageApp;

[Dependency(ReplaceServices = true)]
public class MessageAppBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<MessageAppResource> _localizer;

    public MessageAppBrandingProvider(IStringLocalizer<MessageAppResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
