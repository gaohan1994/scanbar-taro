import Taro from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import "./style/test.list.less";
import classnames from 'classnames';

const ItemHeight: number = 38;

const MenuData = new Array(20).fill({}).map((_, index) => {
  return {
    title: `m${index}`,
    id: `m${index}`,
    index,
  };
});

const ListData = new Array(100).fill({}).map((_, index) => {
  return {
    title: `i${index}`,
    id: `i${index}`,
    menuId: `m${index}`
  };
});

type Props = {};

type State = {
  currentMenuId: string;
  rightScrollIntoViewId: string;
};

export class TestListView extends Taro.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      currentMenuId: 'm0',
      rightScrollIntoViewId: ''
    };
  }

  /**
   * @todo [滑动右边列表至对应id]
   *
   * @memberof TestListView
   */
  public changeRightScrollIntoViewId = (id: string) => {
    this.setState({ rightScrollIntoViewId: id });
  }

  /**
   * @todo [修改选中菜单id]
   *
   * @memberof TestListView
   */
  public changeCurrentMenu = (menu: any) => {
    this.setState({ currentMenuId: menu.id });
  }

  /**
   * @todo [菜单点击，滑动至对应id]
   *
   * @memberof TestListView
   */
  public onMenuClick = (item: any) => {
    this.changeCurrentMenu(item);
    this.changeRightScrollIntoViewId(`i${item.index}`);
  }

  public onScroll = (event: any) => {
    const { target } = event;
    const { scrollTop } = target;
    /**
     * @todo [index] 根据高度判断滑动到第几个item
     */
    const index: number = Math.floor(scrollTop / ItemHeight);
    const currentItem = ListData[index];
    if (currentItem && currentItem.id && currentItem.menuId && this.state.currentMenuId !== currentItem.menuId) {
      this.changeCurrentMenu({id: currentItem.menuId});
    }
  }

  render () {
    const currentMenu: any = MenuData.find(m => m.id === this.state.currentMenuId) || {};
    return (
      <View className="test-list">
        <ScrollView
          scrollY={true}
          className="test-list-left"
          scrollIntoView={this.state.currentMenuId}
        >
          {
            MenuData.map((item) => {
              return (
                <View 
                  key={item.id}
                  id={item.id}
                  onClick={() => this.onMenuClick(item)}
                  className={classnames({
                    "test-list-left-item": true,
                    'test-list-left-current': item.id === this.state.currentMenuId
                  })}
                >
                  <Text 
                    className={classnames({
                      "normal-text": true,
                      'test-list-left-current-text': item.id === this.state.currentMenuId
                    })}
                  >
                    {item.title}
                  </Text>
                </View>
              );
            })
          }
          
        </ScrollView>
        <View
          className={classnames({"test-list-right": true})}
        >
          <View className="test-list-right-title">
            {currentMenu && currentMenu.title}
          </View>
          <ScrollView
            scrollY={true}
            scrollIntoView={this.state.rightScrollIntoViewId}
            className="test-list-right"
            scrollWithAnimation={true}
            enableBackToTop={true}
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
      </View>
    );
  }
}