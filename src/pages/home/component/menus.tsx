import Taro, { useDidShow, useState } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "../../style/home.less";
import loginManager from "../../../common/sdk/sign/login.manager";
import "../../../component/common/card/card.less";

function HomeMenus() {
  const [menus, setMenus] = useState([] as any[]);

  useDidShow(() => {
    loginManager.getUserInfo().then((response: any) => {
      console.log("response", response);
      if (!!response.success) {
        setMenus(response.result.menus);
      }
    });
  });

  const NavItems = [
    {
      image: "//net.huanmusic.com/weapp/-icon_menu_proceeds.png",
      value: "收款",
      subTitle: "Gathering",
      url: "/pages/pay/pay.input"
    },
    {
      image: "//net.huanmusic.com/weapp/v2/icon_menu_details.png",
      value: "查账",
      subTitle: "Inquiry account",
      url: "/pages/order/order.main"
    },
    {
      image: "//net.huanmusic.com/weapp/v2/icon_menu_order.png",
      value: "线上订单",
      subTitle: "Gathering",
      url: "/pages/order/order.online.list"
    },
    {
      image: "//net.huanmusic.com/weapp/icon_menu_more.png",
      value: "退货",
      subTitle: "Even more",
      url: "/pages/product/product.refund"
    }
  ];
  console.log("menus", menus);
  const memberToken = menus.some(menu => menu.name === "会员");
  if (!!memberToken) {
    NavItems.push({
      image: "//net.huanmusic.com/weapp/-icon_menu_member.png",
      value: "会员",
      subTitle: "Member management",
      url: "/pages/member/member"
    });
  }
  const productToken = menus.some(menu => menu.name === "商品");
  if (!!productToken) {
    NavItems.push({
      image: "//net.huanmusic.com/weapp/icon_menu_commodity.png",
      value: "商品",
      subTitle: "Commodity management",
      url: "/pages/product/product.manage"
    });
  }
  const inventoryToken = menus.some(menu => menu.name === "采购");
  if (!!inventoryToken) {
    NavItems.push({
      image: "//net.huanmusic.com/weapp/icon_menu_inventory1.png",
      value: "进货",
      subTitle: "inventory",
      url: "/pages/inventory/inventory.main"
    });
  }
  const stockToken = menus.some(menu => menu.name === "库存");
  if (!!stockToken) {
    NavItems.push({
      image: "//net.huanmusic.com/weapp/icon_menu_procurement1.png",
      value: "盘点",
      subTitle: "Procurement",
      url: "/pages/inventory/inventory.stock"
    });
  }

  if (false) {
    // {
    //   image: '//net.huanmusic.com/weapp/icon_menu_procurement1.png',
    //   value: 'share',
    //   subTitle: 'Procurement',
    //   url: '/pages/share/share',
    // },
    // {
    //   image: '//net.huanmusic.com/weapp/icon_menu_procurement1.png',
    //   value: 'register',
    //   subTitle: 'Procurement',
    //   url: '/pages/sign/register',
    // },
  }

  function onNavHandle(item: any) {
    if (item.value === "更多") {
      Taro.showToast({
        icon: "none",
        title: "正在开发中"
      });
      return;
    }

    if (!loginManager.getUserToken().success) {
      Taro.showModal({
        title: "提示",
        content: "请先登录",
        success: result => {
          if (result.confirm) {
            Taro.redirectTo({
              url: `/pages/sign/login`
            });
          }
        }
      });
      return;
    }

    Taro.navigateTo({ url: item.url });
  }

  return (
    <View className="home-bar">
      {NavItems.map((item, index) => {
        return (
          <View
            key={item.value}
            className={`theme-card common-card card-class home-bar-card ${
              (index + 1) % 3 !== 0 ? "home-bar-card-right" : ""
            } `}
          >
            <View
              className="home-bar-card-content"
              onClick={() => onNavHandle(item)}
            >
              <Image className="home-icon home-card-icon" src={item.image} />
              <Text className="home-normal-text">{item.value}</Text>
              <Text className="home-small-text">{item.subTitle}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default HomeMenus;
