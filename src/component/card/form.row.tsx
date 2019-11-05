/**
 * @Author: Ghan 
 * @Date: 2019-11-05 14:41:35 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-05 14:42:17
 * 
 * @todo [fockedTaroUiListItem,增加以及修改了一些属性]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import classnames from 'classnames';
import './form.card.less';
import '../../styles/index.css';
import { AtButton } from 'taro-ui';

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
  extraThumbClick?: () => any;  // 右边图片点击事件
  className?: any;              // 外部className
  buttons?: ListRowButton[];    // ListRow 的右侧按钮
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
    iconInfo: {},
    onClick: () => {/** */},
    extraThumbClick: () => {/** */},
    buttons: [],
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
      extraThumbClick,
      buttons,
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
      <View className={rootClass}>
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
            {extraText && <View className='item-extra__info'>{extraText}</View>}

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
              <View className='item-extra__icon'>
                <Text
                  className={`at-icon item-extra__icon-arrow at-icon-chevron-${arrow}`}
                />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }
}

export default FormRow;