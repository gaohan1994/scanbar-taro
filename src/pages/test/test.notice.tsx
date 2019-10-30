import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtNoticebar, AtMessage, AtButton } from 'taro-ui';
import "./style/test.main.less";

type Props = { };

class TestNotice extends Taro.Component <Props> {

  public handleClick = (type?: any) => {
    Taro.atMessage({
      'message': 'message',
      'type': type
    });
  }

  render () {
    const commonStyleName = "test-divider";
    return (
      <View>
        <AtNoticebar className={commonStyleName}>这是 NoticeBar 通告栏</AtNoticebar>
        <AtNoticebar className={commonStyleName} marquee={true} >
          这是 NoticeBar 通告栏，这是 NoticeBar 通告栏，这是 NoticeBar 通告栏
        </AtNoticebar>

        <AtNoticebar className={commonStyleName} icon='volume-plus'>
          这是 NoticeBar 通告栏，这是 NoticeBar 通告栏，这是 NoticeBar 通告栏
        </AtNoticebar>

        <AtMessage />
        <AtButton className={commonStyleName} onClick={() => this.handleClick()}>
          普通消息
        </AtButton>
        <AtButton className={commonStyleName} onClick={() => this.handleClick('success')}>
          成功消息
        </AtButton>
        <AtButton className={commonStyleName} onClick={() => this.handleClick('error')}>
          错误消息
        </AtButton>
        <AtButton className={commonStyleName} onClick={() => this.handleClick('warning')}>
          警告消息
        </AtButton>
      </View>
    );
  }
}

export default TestNotice;