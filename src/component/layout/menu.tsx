import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import classnames from "classnames";
import "./header.layout.less";

const cssPrefix = "tabs-header";

type Menu = {
  title: string;
};

type Props = {
  menus: Menu[];
  current?: string;
  position?: string;
  onPress?: (menu: Menu) => void;
  onClose?: () => void;
  visible: boolean;
};

type State = {};

class TabsMenu extends Taro.Component<Props, State> {
  static options: Taro.ComponentOptions = {
    addGlobalClass: true
  };

  static defaultProps = {
    tabs: [{ id: 1, title: "全部品类" }],
    onClose: () => {
      /** */
    }
  };

  public onContentItemClick = (menu: Menu) => {
    const { onPress, onClose } = this.props;
    if (onPress) {
      onPress(menu);

      if (onClose) {
        onClose();
      }
    }
  };

  render() {
    const { menus, onClose, visible, position, current } = this.props;
    if (visible) {
      return (
        <View
          className={`${cssPrefix}-content-mask ${cssPrefix}-content-mask-menu`}
        >
          <View
            className={classnames(
              `${cssPrefix}-content ${cssPrefix}-content-menus`,
              {
                [`${cssPrefix}-content-pos`]: true,
                [`${cssPrefix}-content-pos-${position}`]: !!position
              }
            )}
          >
            {menus.map(tab => {
              return (
                <View
                  key={tab.title}
                  className={classnames(`${cssPrefix}-content-menu`, {
                    [`${cssPrefix}-content-menu-active`]: current === tab.title
                  })}
                  onClick={() => this.onContentItemClick(tab)}
                >
                  {tab.title.length < 5
                    ? tab.title
                    : (tab.title as string).slice(0, 5)}
                </View>
              );
            })}
            {position === "left" && (
              <View
                className={classnames(`${cssPrefix}-content-menu`)}
                onClick={() => this.onContentItemClick(undefined as any)}
              >
                全部门店
              </View>
            )}

            {this.props.children}
          </View>
          <View
            className={`${cssPrefix}-content-mask-touch`}
            onClick={() => (onClose as any)()}
          />
        </View>
      );
    }
    return <View />;
  }
}

export default TabsMenu;
