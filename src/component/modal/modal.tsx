/**
 * @Author: Ghan 
 * @Date: 2019-11-04 13:49:58 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-06 14:15:41
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
import { View, Text } from '@tarojs/components';
import "./modal.less";
import { AtModalProps } from 'taro-ui/@types/modal';
import merge from 'lodash.merge';
import classnames from 'classnames';

const ModalCssPrefix = 'component-modal';

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
}

interface State { }

class Modal extends Taro.Component<Props, State> {

  static defaultProps = {
    header: null,
    buttons: [],
    renderHeader: undefined,
    renderFooter: undefined,
  };

  render () {
    const { header, buttons, renderHeader, renderFooter } = this.props;
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
              <Text className={`${ModalCssPrefix}-header-text`}>{header}</Text>
            </View>
          )}
          {renderHeader && renderHeader()}
          <View className={`${ModalCssPrefix}-content`}>
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