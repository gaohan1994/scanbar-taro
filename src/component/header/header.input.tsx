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
  isRenderScan?: boolean;
  scanClick?: any;
  containerClassName?: string;
} & InputProps;

class HeaderInput extends Taro.Component<Props> {

  static options: Taro.ComponentOptions = {
    addGlobalClass: true
  };

  static defaultProps = {
    renderInputRight: false,
    rightClick: undefined,
    className: undefined,
    containerClassName: undefined,
  };

  render () {
    const { value, onInput, placeholder, isRenderScan, scanClick, isRenderInputRight, inputRightClick, className } = this.props;
    return (
      <View className={`${cssPrefix}-header`}>
        <View className={classnames(`${memberPrefix}-main-header-search`, className)}>
          <Image src="//net.huanmusic.com/weapp/icon_import.png" className={`${memberPrefix}-main-header-search-icon`} />
          <Input 
            className={classnames(`${memberPrefix}-main-header-search-input`, className)} 
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
                src="//net.huanmusic.com/weapp/icon_del_1.png" 
                className={`${memberPrefix}-main-header-search-del`} 
              />
            </View>
          )}
          {!!isRenderScan && (
            <View
              onClick={scanClick}
              className={`${memberPrefix}-main-header-search-scan ${memberPrefix}-main-header-search-mar`} 
            >
              <Image
                src="//net.huanmusic.com/weapp/icon_commodity_scan.png" 
                className={`${memberPrefix}-main-header-search-scan`} 
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