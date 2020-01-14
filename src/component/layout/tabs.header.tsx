import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import classnames from 'classnames';
import "./header.layout.less";
import { AtTabs } from 'taro-ui';

const cssPrefix = 'tabs-header';
type Props = {
  tabs: any[];
  position?: string;
  onChange?: (tab: any) => void;
};

type State = {
  current: number;
  visible: boolean;
};

class TabsHeader extends Taro.Component<Props, State> {

  static options: Taro.ComponentOptions = {
    addGlobalClass: true
  };

  static defaultProps = {
    tabs: [{id: 1, title: '全部品类'}]
  };

  readonly state: State = {
    visible: false,
    current: 0,
  };

  public onClickHandle = (value) => {
    const { onChange, tabs } = this.props;
    this.setState({ current: value }, () => {
      if (onChange) {
        onChange(tabs[value]);
      }
    });
    this.onChangeVisible(false);
  }

  public onChangeVisible = (visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        visible: typeof visible === 'boolean' ? visible : !prevState.visible
      };
    });
  }

  public onContentItemClick = (type: any) => {
    const { tabs } = this.props;
    const index = tabs.findIndex(t => t.title === type.title);
    if (index !== -1) {
      this.onClickHandle(index);
    }
  }

  render () {
    const { tabs } = this.props; 
    const { current } = this.state;
    return (
      <View className={`${cssPrefix} ${cssPrefix}-pos`}>
        <AtTabs
          className={`${cssPrefix}-pos`}
          current={current}
          scroll={true}
          tabList={tabs}
          onClick={this.onClickHandle.bind(this)}
        />
        {this.renderCorner()}
        {this.renderTabsContent()}
      </View>
    );
  }

  private renderCorner = () => {
    const { visible } = this.state;
    return (
      <View 
        className={`${cssPrefix}-corner`}
        onClick={() => this.onChangeVisible()}
      >
        {
          visible === true ? (
            <Image
              src="//net.huanmusic.com/weapp/icon_packup_white.png" 
              className={`${cssPrefix}-corner-image`}
            />
          ) : (
            <Image
              src="//net.huanmusic.com/weapp/icon_packup_white.png" 
              className={`${cssPrefix}-corner-image ${cssPrefix}-corner-image-down`}
            />
          )
        }
        
      </View>
    );
  }

  private renderTabsContent = () => {
    const { tabs } = this.props;
    const { visible } = this.state;
    if (visible) {
      return (
        <View className={`${cssPrefix}-content-mask`}>
          <View className={`${cssPrefix}-content`}>
            {
              tabs.map((tab) => {
                return (
                  <View 
                    key={tab.id}
                    className={classnames(`${cssPrefix}-content-item`)}
                    onClick={() => this.onContentItemClick(tab)}
                  >
                    {tab.title.length < 5 ? tab.title : (tab.title as string).slice(0, 5)}
                  </View>
                );
              })
            }
          </View>
        </View>
      );
    }
    return <View />;
  }
}

export default TabsHeader;