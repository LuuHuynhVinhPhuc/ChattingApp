using MessageApp.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace MessageApp.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class MessageAppController : AbpControllerBase
{
    protected MessageAppController()
    {
        LocalizationResource = typeof(MessageAppResource);
    }
}
