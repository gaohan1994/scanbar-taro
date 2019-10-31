import Taro from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import "./style/test.list.less";
import { CommonEventFunction } from '@tarojs/components/types/common';

const MenuData = new Array(20).fill({}).map((_, index) => {
  return {
    title: `m${index}`,
    id: `m${index}`,
    index,
  };
});

const ListData = new Array(20).fill({}).map((_, index) => {
  return {
    title: `i${index}`,
    id: `i${index}`
  };
});

type Props = {};

type State = {
  currentMenuIndex: number;
  rightScrollIntoViewId: string;
};

export class TestListView extends Taro.Component<Props, State> {
  private leftListRef: any;
  private rightListRef: any;

  constructor (props: Props) {
    super(props);
    this.state = {
      currentMenuIndex: 0,
      rightScrollIntoViewId: ''
    };
  }

  public changeRightScrollIntoViewId = (id: string) => {
    this.setState({ rightScrollIntoViewId: id });
  }

  public onMenuClick = (item: any) => {
    console.log('leftListRef: ', this.leftListRef);
    console.log('rightListRef: ', this.rightListRef);
    this.changeRightScrollIntoViewId(`i${item.index}`);
  }

  public onScroll = (event: CommonEventFunction) => {
    console.log('event: ', event);
  }

  render () {
    return (
      <View className="test-list">
        <ScrollView
          scrollY={true}
          className="test-list-left"
          ref={ref => this.leftListRef = ref}
        >
          {
            MenuData.map((item) => {
              return (
                <View 
                  key={item.id}
                  id={item.id}
                  onClick={() => this.onMenuClick(item)}
                  className="test-list-left-item"
                >
                  <Text className="normal-text">{item.title}</Text>
                </View>
              );
            })
          }
          
        </ScrollView>
        <ScrollView
          scrollY={true}
          scrollIntoView={this.state.rightScrollIntoViewId}
          className="test-list-right"
          scrollWithAnimation={true}
          enableBackToTop={true}
          ref={ref => this.rightListRef = ref}
          onScroll={this.onScroll}
        >
          {
            ListData.map((item) => {
              return (
                <View 
                  key={item.id}
                  id={item.id}
                  // onClick={this.onMenuClick}
                  className="test-list-right-item"
                >
                  <Text className="normal-text">{item.title}</Text>
                </View>
              );
            })
          }
        </ScrollView>
      </View>
    );
  }
}