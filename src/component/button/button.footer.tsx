import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import "../../pages/style/product.less";
import classnames from 'classnames';

export type ButtonProps = {
  onPress: () => void;
  title: string;
  type?: string;
};

type Props = { 
  className?: string;
  buttons: ButtonProps[];
};

class ButtonFooter extends Taro.Component<Props> {

  static options = {
    addGlobalClass: true
  };

  render () {
    const { className, buttons } = this.props;
    return (
      <View className={classnames(`product-add-buttons`, className)}>
        {
          buttons && buttons.map((button) => {
            return (
              <View 
                key={button.title}
                className={classnames({
                  [`product-add-buttons-three`]: buttons.length >= 3,
                  [`product-add-buttons-button`]: buttons.length > 1 && buttons.length < 3,
                  [`product-add-buttons-one`]: buttons.length === 1,
                })}
              >
                <AtButton 
                  className={classnames({
                    [`theme-button`]: button.type !== 'cancel',
                    [`theme-button-cancel`]: button.type === 'cancel',
                  })}
                  onClick={button.onPress}
                >
                  <Text className="theme-button-text" >{button.title}</Text>
                </AtButton>
              </View>
            );
          })
        }
      </View>
    );
  }
}

export default ButtonFooter;