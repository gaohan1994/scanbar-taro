/**
 * @Author: Ghan 
 * @Date: 2019-11-04 16:14:24 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-05 14:19:53
 * @todo [测试modal页面]
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "./style/test.main.less";
import Modal from '../../component/modal/modal';
import { AtList, AtListItem } from 'taro-ui';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';

interface Props { }

interface State {
  modal1: boolean;  // 建档
  modal2: boolean;  // 扫一扫
  modal3: boolean;  // 库存调整
}

class TestModal extends Taro.Component<Props, State> {

  readonly state: State = {
    modal1: false,
    modal2: false,
    modal3: false,
  };

  public changeModal = (key: string, visible?: boolean) => {
    this.setState(prevState => {
      return { 
        ...prevState,
        [`${key}`]: typeof visible === 'boolean' ? visible : !prevState.modal1
      };
    });
  }

  render () {
    const modal1buttons: any[] = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => this.changeModal('modal1', false)
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.changeModal('modal1', false)
      },
    ];

    const items: FormRowProps[] = [
      {
        title: '类别',
        extraText: '饮料',
        arrow: 'right'
      },
      {
        title: '规格',
      },
      {
        title: '品牌',
        extraText: '未指定',
        arrow: 'right',
      },
      {
        title: '单位',
        extraText: '未指定',
        arrow: 'right',
        hasBorder: false
      }
    ];
    const modal3buttons: any[] = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => this.changeModal('modal3', false)
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.changeModal('modal3', false)
      },
    ];
    return (
      <View>
        <AtList>
          <AtListItem title="建档" onClick={() => this.changeModal('modal1', true)} />
          <AtListItem title="扫一扫" onClick={() => this.changeModal('modal2', true)} />
          <AtListItem title="库存调整" onClick={() => this.changeModal('modal3', true)} />
        </AtList>
        <Modal 
          isOpened={this.state.modal1}
          onClose={() => this.changeModal('modal1', false)}
          buttons={modal1buttons}
          renderHeader={() => {
            return (
              <View>header</View>
            );
          }}
        >
          <View>该商品不存在，是否现在建档？</View>
        </Modal>

        <Modal 
          isOpened={this.state.modal2}
          header="扫描结果"
          onClose={() => this.changeModal('modal2', false)}
        >
          <View>上好佳芒果味硬糖</View>
          <View>￥10.00/包</View>
        </Modal>

        <Modal 
          isOpened={this.state.modal3}
          header="库存调整"
          onClose={() => this.changeModal('modal3', false)}
          buttons={modal3buttons}
        >
          <View className="test-modal-form">
            <View>上好佳芒果味硬糖</View>
            <FormCard items={items} />
          </View>
        </Modal>
      </View>
    );
  }
}

export default TestModal;