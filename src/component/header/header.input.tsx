import Taro from '@tarojs/taro'; 
import { View, Image, Input } from '@tarojs/components';
import "../../pages/style/member.less";
import "../../pages/style/product.less";
import { InputProps } from '@tarojs/components/types/Input';
import classnames from 'classnames';

const memberPrefix = 'member';
const cssPrefix = 'product';

type Props = { 
  isRenderInputRight?: boolean;
  inputRightClick?: any;
} & InputProps;

class HeaderInput extends Taro.Component<Props> {
  static defaultProps = {
    renderInputRight: false,
    rightClick: undefined,
  };

  render () {
    const { value, onInput, placeholder, isRenderInputRight, inputRightClick } = this.props;
    return (
      <View className={`${cssPrefix}-header`}>
        <View className={`${memberPrefix}-main-header-search ${cssPrefix}-header-search`}>
          <Image src="//net.huanmusic.com/weapp/icon_import.png" className={`${memberPrefix}-main-header-search-icon`} />
          <Input 
            className={classnames(`${memberPrefix}-main-header-search-input`, {
              [``]: true
            })} 
            placeholder={placeholder}
            value={value}
            onInput={onInput}
            placeholderClass={`${memberPrefix}-main-header-search-input-holder`}
          />
          {isRenderInputRight && value !== '' && (
            <View 
              className={`${memberPrefix}-main-header-search-scan ${memberPrefix}-main-header-search-mar`} 
              onClick={inputRightClick}  
            >
              <Image 
                src="//net.huanmusic.com/weapp/icon_del.png" 
                className={`${memberPrefix}-main-header-search-del`} 
              />
            </View>
          )}
        </View>
        {this.props.children}
      </View>
    );
  }
}

export default HeaderInput;