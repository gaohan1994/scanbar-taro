/**
 * @Author: Ghan 
 * @Date: 2019-11-05 14:41:35 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-04 13:45:22
 * 
 * @todo [fockedTaroUiListItem,增加以及修改了一些属性]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import classnames from 'classnames';
import '../../styles/index.css';
import './form.card.less';
import { AtButton, AtInput } from 'taro-ui';

interface ListRowButton {
  onPress: () => void;
  title: string;
  type?: string;
}

export interface FormRowProps { 
  note?: string;                // 左边小文字
  arrow?: string;               // 箭头方向
  thumb?: string;               // 图片
  title?: string;               // 左边标题
  extraText?: string;           // 右边文字
  iconInfo?: any;               // Icon相关信息
  disabled?: boolean;           // 是否禁用
  hasBorder?: boolean;          // 是否有底部border
  extraThumb?: string;          // 右边图片
  onClick?: () => any;          // 点击事件
  extraThumbClick?: () => any;  // 右边图片点击事件
  className?: any;              // 外部className
  buttons?: ListRowButton[];    // ListRow 的右侧按钮
  isInput?: boolean;            // 是否显示输入框
  inputValue?: string;          // 右侧输入框
  inputPlaceHolder?: string;    // 右侧输入框默认值
  inputName?: string;           // 输入框的name
  inputOnChange?: (params: any) => any; // 输入改变函数
  inputType?: 'text' | 'number' | 'password' | 'phone' | 'digit'; // 输入框类型
  extraTextStyle?: 'price' | 'black' | 'gray';      // 右边文字颜色
}

interface FormRowState { }

class FormRow extends Taro.Component<FormRowProps, FormRowState> {

  static defaultProps = {
    note: '',
    disabled: false,
    title: '',
    thumb: '',
    hasBorder: true,
    extraText: '',
    extraThumb: '',
    extraTextStyle: 'black',
    iconInfo: {},
    onClick: () => {/** */},
    extraThumbClick: () => {/** */},
    buttons: [],
    isInput: false,
    inputValue: '',
    inputName: 'form.row.name',
    inputPlaceHolder: '',
    inputType: 'text',
    inputOnChange: () => { /** */ },
  };

  render () {
    let {
      extraText,
      title,
      note,
      thumb,
      disabled,
      hasBorder,
      arrow,
      extraThumb,
      extraTextStyle,
      extraThumbClick,
      buttons,
      onClick,

      isInput,
      inputType,
      inputName,
      inputValue,
      inputPlaceHolder,
      inputOnChange,
      children
    } = this.props;

    const rootClass = classnames(
      'at-list__item',
      {
        'at-list__item--thumb': thumb,
        'at-list__item--multiple': note,
        'at-list__item--disabled': disabled,
        'at-list__item--no-border': !hasBorder
      },
      this.props.className
    );

    extraText = String(extraText);
    title = String(title);
    return (
      <View className={rootClass} onClick={onClick}>
        <View className='at-list__item-container'>
          {thumb && (
            <View className='at-list__item-thumb item-thumb'>
              <Image
                className='item-thumb__info'
                mode='scaleToFill'
                src={thumb}
              />
            </View>
          )}

          <View className='at-list__item-content item-content'>
            <View className='item-content__info'>
              <View className='item-content__info-title'>{title}</View>
              {note && <View className='item-content__info-note'>{note}</View>}
            </View>
          </View>

          <View className='at-list__item-extra item-extra component-list-row-extra'>
            {extraText && (
              <View 
                className={classnames({
                  // 'item-extra__info': extraTextStyle !== 'price',
                  'component-form-price': extraTextStyle === 'price',
                  'component-form-black': extraTextStyle === 'black',
                  'component-form-gray': extraTextStyle === 'gray',
                })} 
              >
                {extraText}
              </View>
            )}

            {isInput === true && (
              <View className="component-form-input">
                <AtInput 
                  className={classnames('component-list-row-input')}
                  name={inputName || 'form.row.name'}
                  value={inputValue} 
                  onChange={inputOnChange}
                  type={inputType}
                  placeholder={inputPlaceHolder}
                  border={false}
                  placeholderClass="component-list-placeholder"
                />
              </View>
            )}

            {buttons && buttons.length > 0 && (
              <View className="component-form-buttons">
                {buttons.map((button) => {
                  return (
                    <AtButton
                      key={button.title}
                      onClick={button.onPress}
                      type="primary"
                      className={classnames(
                        'component-list-row-button', 
                        {
                          'component-list-row-confirm-button': button.type !== 'cancel' ? true : false,
                          'component-list-row-cancel-button': button.type === 'cancel' ? true : false,
                        }
                      )}
                    >
                      {button.title}
                    </AtButton>
                  );
                })}
              </View>
            )}

            {children}
            
            {extraThumb && (
              <View className='item-extra__image' onClick={extraThumbClick}>
                <Image
                  className='item-extra__image-info'
                  mode='aspectFit'
                  src={extraThumb}
                />
              </View>
            )}

            {arrow ? (
              <Image 
                src="//net.huanmusic.com/weapp/icon_commodity_into.png" 
                className={`component-form-arrow`}
              />
              // <View className='item-extra__icon'>
              //   <Text
              //     className={`at-icon item-extra__icon-arrow at-icon-chevron-${arrow}`}
              //   />
              // </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }
}

export default FormRow;