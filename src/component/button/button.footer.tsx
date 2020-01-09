import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import "../../pages/style/product.less";
import classnames from 'classnames';

type ButtonProps = {
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
                  [`product-add-buttons-button`]: buttons.length > 1,
                  [`product-add-buttons-one`]: buttons.length === 1,
                })}
              >
                <AtButton 
                  className="theme-button"
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