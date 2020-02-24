/**
 * @Author: Ghan 
 * @Date: 2019-11-05 14:41:35 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-17 17:26:54
 * 
 * @todo [fockedTaroUiListItem,增加以及修改了一些属性]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import classnames from 'classnames';
import './style.sass';
import './form.card.less';
import { AtButton, AtInput } from 'taro-ui';

interface ListRowButton {
  onPress: () => void;
  title: string;
  type?: string;
}

export interface FormRowProps { 
  main?: boolean;               // 左边角标
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
  infoColor?: '333333' | '666666';
  inputType?: 'text' | 'number' | 'password' | 'phone' | 'digit'; // 输入框类型
  extraTextStyle?: 'price' | 'black' | 'gray' | 'title' | 'maxWidth';      // 右边文字颜色
  extraTextColor?: string;      // 右边字体颜色
  extraTextSize?: string;       // 右边字体大小
  extraTextBold?: 'bold';       // 是否加粗
  inputCursorSpacing?: number;  // cursorSpacing
  maxInput?: boolean;           // 右侧450px input
}

interface FormRowState { }

class FormRow extends Taro.Component<FormRowProps, FormRowState> {

  static defaultProps = {
    main: false,
    note: '',
    disabled: false,
    title: '',
    thumb: '',
    hasBorder: true,
    extraText: '',
    extraThumb: '',
    extraTextStyle: 'black',
    infoColor: '333333',
    extraTextBold: '',
    iconInfo: {},
    onClick: () => {/** */},
    extraThumbClick: () => {/** */},
    buttons: [],
    isInput: false,
    maxInput: false,
    inputValue: '',
    inputName: 'form.row.name',
    inputPlaceHolder: '',
    extraTextColor: undefined,
    extraTextSize: undefined,
    inputType: 'text',
    inputOnChange: () => { /** */ },
  };

  render () {
    let {
      main,
      extraText,
      title,
      note,
      thumb,
      disabled,
      hasBorder,
      arrow,
      extraThumb,
      extraTextStyle,
      extraTextBold,
      extraThumbClick,
      buttons,
      onClick,
      infoColor,
      isInput,
      inputType,
      maxInput,
      inputName,
      inputValue,
      inputPlaceHolder,
      inputOnChange,
      extraTextColor,
      inputCursorSpacing,
      extraTextSize,
      children,
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
              
              <View 
                className={classnames('item-content__info-title', `component-form-info-${infoColor}`)}
              >
                {title}{main ? <View className="item-content__info-icon">*</View> : null}
              </View>
              {note && <View className='item-content__info-note'>{note}</View>}
            </View>
          </View>

          <View className='at-list__item-extra item-extra component-list-row-extra'>
            {extraText && (
              <View 
                className={classnames(
                  `component-form-${extraTextStyle}`, {
                  'component-form-bold': extraTextBold === 'bold',
                  [`component-form-size-${extraTextSize}`]: !!extraTextSize,
                })}
                style={`${!!extraTextColor ? `color: ${extraTextColor};` : ''}`}
              >
                {extraText}
              </View>
            )}

            {isInput === true && (
              <View 
                className={classnames({
                  ["component-form-input"]: buttons && buttons.length > 0,
                  ['component-form-input-max']: maxInput,
                })}
              >
                <AtInput 
                  className={classnames('component-list-row-input')}
                  name={inputName || 'form.row.name'}
                  value={inputValue} 
                  onChange={inputOnChange}
                  type={inputType}
                  placeholder={inputPlaceHolder}
                  border={false}
                  cursorSpacing={inputCursorSpacing}
                  placeholderClass="component-list-placeholder"
                  placeholderStyle="color: #cccccc;"
                />
              </View>
            )}

            {buttons && buttons.length > 0 && (
              <View className="component-form-buttons">
                {buttons.map((button) => {
                  return (
                    <View
                      key={button.title}
                      onClick={button.onPress}
                      className={classnames(
                        'component-form-button', 
                        {
                          'component-form-button-confirm': button.type !== 'cancel' ? true : false,
                          'component-form-button-cancel': button.type === 'cancel' ? true : false,
                        }
                      )}
                    >
                      {button.title}
                    </View>
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
            ) : null}
          </View>
        </View>
      </View>
    );
  }
}

export default FormRow;