import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import classnames from 'classnames';
import ButtonFooter, { ButtonProps } from '../button/button.footer';
import "../../pages/style/product.less";

const cssPrefix = 'product';

type Props = {
  visible: boolean;
  title?: string;
  buttons?: ButtonProps[];
  contentClassName?: string;
  onClose?: () => void;
};

class ModalLayout extends Taro.Component<Props> {

  static options: Taro.ComponentOptions = {
    addGlobalClass: true
  };

  static defaultProps = {
    onClose: undefined,
    buttons: [],
  };

  render () {
    const { visible, title, buttons, onClose, contentClassName } = this.props;
    if (visible) {
      return (
        <View className={`product-pay-member-layout-mask`} >
          <View 
            className={`${cssPrefix}-select-mask`} 
            onClick={onClose}
          />
          <View 
            className={`product-pay-member-layout-box product-pay-member-layout-container`}
            style="background-color: #ffffff;"
          >
            <Image 
              src="//net.huanmusic.com/weapp/icon_del.png" 
              className={`${cssPrefix}-select-header-close`}
              onClick={onClose}
            />
            {title && (
              <View className={`${cssPrefix}-select-header`}>{title}</View>
            )}
            <View 
              className={classnames(`${cssPrefix}-select-content`, {
                [`${cssPrefix}-select-content-nonfooter`]: buttons && buttons.length === 0,
                [`${contentClassName}`]: contentClassName,
              })}
            >
              {this.props.children}
              <View style="height: 20px; width: 100%"  />
            </View>
            {buttons && buttons.length > 0 && (
              <ButtonFooter buttons={buttons} />
            )}
          </View>
        </View>
      );
    }
    return <View/>;
  }
}

export default ModalLayout;