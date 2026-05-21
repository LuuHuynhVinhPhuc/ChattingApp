using MessageApp.Localization;
using Volo.Abp.Application.Services;

namespace MessageApp;

/* Inherit your application services from this class.
 */
public abstract class MessageAppAppService : ApplicationService
{
    protected MessageAppAppService()
    {
        LocalizationResource = typeof(MessageAppResource);
    }
}
