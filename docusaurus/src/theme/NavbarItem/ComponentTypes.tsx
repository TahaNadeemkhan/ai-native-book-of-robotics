import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import AuthToggle from '@site/src/components/AuthToggle';
import SettingsButton from '@site/src/components/SettingsButton';
import NavbarAIControls from '@site/src/components/NavbarAIControls';

export default {
  ...ComponentTypes,
  'custom-authToggle': AuthToggle,
  'custom-settingsButton': SettingsButton,
  'custom-aiControls': NavbarAIControls,
};
