/**
 * @Author: Ghan 
 * @Date: 2019-11-04 13:49:58 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-13 16:00:52
 * 
 * @Usage
 * ```jsx
 * 
 * import Modal from 'component/modal';
 * 
 * render () {
 *  return (
 *    <Modal 
 *      isOpend={this.state.isOpend}
 *      onClose={() => this.setState({isOpend: false})}
 *      header="hello"
 *    >
 *      <View>world</View>
 *    </Modal>
 *  )
 * }
 * ```
 */
import Taro from '@tarojs/taro';
import { AtModal, AtButton } from 'taro-ui';
import { View, Text, Input } from '@tarojs/components';
import "./modal.less";
import { AtModalProps } from 'taro-ui/@types/modal';
import merge from 'lodash.merge';
import classnames from 'classnames';
import { InputProps } from '@tarojs/components/types/Input';

const ModalCssPrefix = 'component-modal';

export type ModalInput = {
  title: string;
  main?: boolean;
} & Partial<InputProps>;

interface ModalButton {
  onPress: () => void;
  title: string;
  type?: string;
}

interface Props extends AtModalProps {
  header: any;              // modal 标题
  buttons?: ModalButton[];  // modal 的按钮
  renderHeader?: () => any; // 自定义渲染 modal 标题
  renderFooter?: () => any; // 自定义渲染 modal 底部
  tip?: string;
  inputs?: ModalInput[];
}

interface State { }

class Modal extends Taro.Component<Props, State> {

  static defaultProps = {
    header: null,
    buttons: [],
    renderHeader: undefined,
    renderFooter: undefined,
    tip: undefined,
    inputs: undefined,
  };

  render () {
    const { header, buttons, renderHeader, renderFooter, tip, inputs } = this.props;
    const showHeader = header && header.length > 0;
    
    /**
     * @param {ModalProps} HackerCode
     */
    const ModalProps: any = merge({}, this.props);
    delete ModalProps.header;
    delete ModalProps.buttons;
    delete ModalProps.renderHeader;
    delete ModalProps.renderFooter;
    return (
      <View>
        <AtModal {...ModalProps}>
          {showHeader && (
            <View className={`${ModalCssPrefix}-header`}>
              <View className={`${ModalCssPrefix}-header-text`}>{header}</View>
            </View>
          )}
          {renderHeader && renderHeader()}
          <View className={`${ModalCssPrefix}-content`}>
            {tip && (
              <View className={`${ModalCssPrefix}-content-tip`}>{tip}</View>
            )}
            {inputs && (
              <View>
                {inputs.map((item) => {
                  const { title, main } = item;
                  return (
                    <View 
                      key={title}
                      className={`${ModalCssPrefix}-content-item`}
                    >
                      <View 
                        className={classnames(`${ModalCssPrefix}-content-item-title`, {
                          [`${ModalCssPrefix}-content-item-title-short`]: !(inputs.some(i => i.title.length > 2))
                        })}
                      >
                        {main && (
                          <View className={`${ModalCssPrefix}-content-item-title-main`}>*</View>
                        )}
                        {title}
                      </View>
                      <Input 
                        value={item.value} 
                        onInput={item.onInput}
                        type={item.type}
                        disabled={item.disabled}
                        placeholder={item.placeholder}
                        focus={item.focus}
                        className={`${ModalCssPrefix}-content-item-input`}
                        placeholderClass={`${ModalCssPrefix}-content-item-input-place`}
                      />
                    </View>
                  );
                })}
              </View>
            )}
            {this.props.children}
          </View>
          {buttons && buttons.length > 0 && (
            <View className={`${ModalCssPrefix}-buttons`}>
              {
                buttons.map((button) => {
                  return (
                    <AtButton 
                      key={button.title}
                      onClick={button.onPress}
                      type="primary"
                      className={classnames({
                        'component-modal-confirm-button': button.type !== 'cancel' ? true : false,
                        'component-modal-cancel-button': button.type === 'cancel' ? true : false,
                      })}
                    >
                      <Text className="component-modal-confirm-button-text">{button.title}</Text>
                    </AtButton>
                  );
                })
              }
            </View>
          )}
          {renderFooter && renderFooter()}
        </AtModal>
      </View>
    );
  }
}

export default Modal;