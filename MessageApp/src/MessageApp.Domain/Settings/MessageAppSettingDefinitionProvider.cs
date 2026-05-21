using Volo.Abp.Settings;

namespace MessageApp.Settings;

public class MessageAppSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(MessageAppSettings.MySetting1));
    }
}
