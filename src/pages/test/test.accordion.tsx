import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtAccordion, AtList, AtListItem } from 'taro-ui';

type State = {
  open: boolean;
  open2: boolean;
};

export class TestAccordion extends Taro.Component<any, State> {
  state: State = {
    open: false,
    open2: true,
  };

  public handleClick = (value: any) => {
    this.setState({ open: value });
  }
  public handleClick2 = (value: any) => {
    this.setState({ open2: value });
  }

  render () {
    return (
      <View>
        <AtAccordion  
          open={this.state.open}
          onClick={this.handleClick}
          title="第一个手风琴"
        >
          <AtList hasBorder={false}>
            <AtListItem
              title='标题文字'
              arrow='right'
              thumb='https://img12.360buyimg.com/jdphoto/s72x72_jfs/t6160/14/2008729947/2754/7d512a86/595c3aeeNa89ddf71.png'
            />
            <AtListItem
              title='标题文字'
              note='描述信息'
              arrow='right'
              thumb='http://img10.360buyimg.com/jdphoto/s72x72_jfs/t5872/209/5240187906/2872/8fa98cd/595c3b2aN4155b931.png'
            />
            <AtListItem
              title='标题文字'
              note='描述信息'
              extraText='详细信息'
              arrow='right'
              thumb='http://img12.360buyimg.com/jdphoto/s72x72_jfs/t10660/330/203667368/1672/801735d7/59c85643N31e68303.png'
            />
          </AtList>
        </AtAccordion>
        <AtAccordion  
          open={this.state.open2}
          onClick={this.handleClick2}
          title="第一个手风琴"
        >
          <AtList hasBorder={false}>
            <AtListItem
              title='标题文字'
              arrow='right'
              thumb='https://img12.360buyimg.com/jdphoto/s72x72_jfs/t6160/14/2008729947/2754/7d512a86/595c3aeeNa89ddf71.png'
            />
            <AtListItem
              title='标题文字'
              note='描述信息'
              arrow='right'
              thumb='http://img10.360buyimg.com/jdphoto/s72x72_jfs/t5872/209/5240187906/2872/8fa98cd/595c3b2aN4155b931.png'
            />
            <AtListItem
              title='标题文字'
              note='描述信息'
              extraText='详细信息'
              arrow='right'
              thumb='http://img12.360buyimg.com/jdphoto/s72x72_jfs/t10660/330/203667368/1672/801735d7/59c85643N31e68303.png'
            />
          </AtList>
        </AtAccordion>
        
      </View>
    );
  }
}