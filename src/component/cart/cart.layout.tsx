import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import classNames from 'classnames';
import "./layout.sass";
import "./cart.less";
import "../../pages/style/product.less";

const ENV = Taro.getEnv();
let scrollTop = 0;

function handleTouchScroll (flag: boolean) {
  if (ENV !== Taro.ENV_TYPE.WEB) {
    return;
  }
  if (flag) {
    scrollTop = document.documentElement.scrollTop;

    // 使body脱离文档流
    document.body.classList.add('at-frozen');

    // 把脱离文档流的body拉上去！否则页面会回到顶部！
    document.body.style.top = `${-scrollTop}px`;
  } else {
    document.body.style.top = null;
    document.body.classList.remove('at-frozen');

    document.documentElement.scrollTop = scrollTop;
  }
}

interface Props { 
  isOpened: boolean;
  onClose: () => void;
  className?: any;
  gray?: boolean;
  title?: any;
  scrollY?: any;
  scrollX?: any;
  scrollTop?: any;
  scrollLeft?: any;
  upperThreshold?: any;
  lowerThreshold?: any;
  scrollWithAnimation?: any;
  onScroll?: any;
  onScrollToLower?: any;
  onScrollToUpper?: any;

  titleRight?: any;
  titleRightClick?: any;
  titleRightIcon?: any;
  buttons: any[];
}

interface State {
  _isOpened: boolean;
}

export default class AtFloatLayout extends Taro.Component<Props, State> {

  static defaultProps = {
    title: '',
    isOpened: false,
    scrollY: true,
    scrollX: false,
    gray: false,
    scrollWithAnimation: false,
    onClose: () => { /**/ },
    onScroll: () => { /**/ },
    onScrollToLower: () => { /**/ },
    onScrollToUpper: () => { /**/ },
    titleRight: '',
    titleRightClick: () => { /** */ },
    titleRightIcon: '',
    buttons: undefined,
  };

  constructor (props: Props) {
    super(...arguments);

    const { isOpened } = props;
    this.state = {
      _isOpened: isOpened
    };
  }

  componentWillReceiveProps (nextProps: Props) {
    const { isOpened } = nextProps;

    if (this.props.isOpened !== isOpened) {
      handleTouchScroll(isOpened);
    }

    if (isOpened !== this.state._isOpened) {
      this.setState({
        _isOpened: isOpened
      });
    }
  }

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  close = () => {
    this.setState(
      {
        _isOpened: false
      },
      this.handleClose
    );
  }

  handleTouchMove = e => {
    e.stopPropagation();
  }

  render () {
    const { _isOpened } = this.state;
    const {
      title,
      gray,
      scrollY,
      scrollX,
      scrollTop,
      scrollLeft,
      upperThreshold,
      lowerThreshold,
      scrollWithAnimation,
      titleRight,
      titleRightClick,
      titleRightIcon,
      buttons,
    } = this.props;

    const rootClass = classNames(
      'at-float-layout',
      {
        'at-float-layout--active': _isOpened,
        'at-float-layout-member': !!buttons
      },
      this.props.className
    );

    return (
      <View className={rootClass} onTouchMove={this.handleTouchMove}>
        <View onClick={this.close} className='at-float-layout__overlay' />
        <View className='at-float-layout__container layout'>
          {title ? (
            <View className="cart-list-header">
              {title && (
                <View>{title}</View>
              )}
              {titleRight && (
                <View
                  className="cart-list-header-empty"
                  onClick={titleRightClick}
                >
                  {titleRightIcon && (
                    <Image src={titleRightIcon} className="cart-list-header-empty-icon" />
                  )}
                  <Text>{titleRight}</Text>
                </View>
              )}
            </View>
          ) : null}
          <View 
            className={classNames('layout-body', {
              'layout-body-gray': gray
            })} 
          >
            <ScrollView
              scrollY={scrollY}
              scrollX={scrollX}
              scrollTop={scrollTop}
              scrollLeft={scrollLeft}
              upperThreshold={upperThreshold}
              lowerThreshold={lowerThreshold}
              scrollWithAnimation={scrollWithAnimation}
              onScroll={this.props.onScroll}
              onScrollToLower={this.props.onScrollToLower}
              onScrollToUpper={this.props.onScrollToUpper}
              className='layout-body__content'
            >
              {this.props.children}
            </ScrollView>
          </View>

          {buttons && (
            <View className={`product-add-buttons`}>
              {buttons.map((button) => {
                return (
                  <View 
                    key={button.title}
                    className={classNames(
                      `cart-buttons-button`, 
                      `cart-buttons-${button.type || 'confirm'}`, 
                      {[`cart-buttons-two`]: buttons.length > 1}
                    )}
                  >
                    {button.title}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  }
}