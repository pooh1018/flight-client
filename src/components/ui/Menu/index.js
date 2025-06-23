import Menu from './Menu';
import MenuItem from './MenuItem';
import SubMenu from './SubMenu';
import MenuItemGroup from './MenuItemGroup';

Menu.Item = MenuItem;
Menu.SubMenu = SubMenu;
Menu.ItemGroup = MenuItemGroup;

export { Menu, MenuItem, SubMenu, MenuItemGroup };
export default Menu;
