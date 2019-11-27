/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:16:32 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-26 16:13:24
 */
import requestHttp from "../../common/request/request.http";
import ProductInterfaceMap, { ProductInterface } from "./product";
import { HTTPInterface } from "..";
import { ProductCartInterface } from "../../common/sdk/product/product.sdk";

class ProductService {

  /**
   * @todo 开单页面用到的商品查询接口
   *
   * @memberof ProductService
   */
  public productInfoGetList = async (params?: ProductInterface.ProductInfoGetListFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoGetList(params));
  }

  /**
   * @todo 商品管理用的查询商品接口
   *
   * @memberof ProductService
   */
  public productInfoList = async (params?: ProductInterface.ProductInfoListFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoList(params));
  }

  public productInfoType = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoType);
  }

  public productInfoSupplier = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoSupplier);
  }

  /**
   * @todo 查询商品详情
   *
   * @memberof ProductService
   */
  public productInfoDetail = async (params: ProductInterface.ProductDetailFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoDetail(params));
  }

  public productInfoEdit = async (params: Partial<ProductInterface.ProductInfo>): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(ProductInterfaceMap.productInfoEdit, params);
  }

  /**
   * @todo 自动生成条码
   *
   * @memberof ProductService
   */
  public productInfoGetBarcode = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoGetBarcode);
  }

  public productInfoAdd = async (params: ProductInterface.ProductInfoAdd): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(ProductInterfaceMap.productInfoAdd, params);
  }

  public cashierPay = async (params: ProductCartInterface.ProductPayPayload): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(ProductInterfaceMap.cashierPay, params);
  }

  /**
   * @todo 通过条码查看商品是否在我们的库存中存在
   *
   * @memberof ProductService
   */
  public productInfoScanGet = async (params: ProductInterface.ProductInfoScanGetFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoScanGet(params));
  }

  /**
   * @todo 通过条码查询商品信息
   *
   * @memberof ProductService
   */
  public productInfoScan = async (params: ProductInterface.ProductInfoScanGetFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoScan(params));
  }
}

export default new ProductService();