import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface AbandonedCartEmailProps {
  customerName: string;
  items: {
    name: string;
    variantName?: string;
    image: string;
    price: number;
  }[];
  checkoutUrl: string;
  discountCode?: string;
  discountPercent?: number;
}

export const AbandonedCartEmail = ({
  customerName = "مشتری عزیز",
  items = [],
  checkoutUrl = "https://extim.com/checkout",
  discountCode,
  discountPercent,
}: AbandonedCartEmailProps) => {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>سبد خرید شما در اکستیم منتظر شماست!</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="bg-white border border-gray-200 rounded-xl my-10 mx-auto p-8 max-w-xl shadow-sm">
            <Section className="text-center mb-6">
              <Heading className="text-2xl font-black text-amber-500 m-0 tracking-tight">
                فروشگاه اکستیم
              </Heading>
            </Section>
            
            <Heading className="text-xl font-bold text-gray-900 text-center mb-4">
              سبد خرید شما منتظر شماست! 🛒
            </Heading>
            
            <Text className="text-gray-700 text-base leading-7 mb-6">
              سلام <strong>{customerName}</strong> عزیز،
              <br />
              به نظر می‌رسد فراموش کرده‌اید خرید خود را نهایی کنید. محصولاتی که در سبد خرید خود قرار داده بودید هنوز موجود هستند، اما ممکن است به زودی تمام شوند!
            </Text>
            
            <Section className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              {items.map((item, index) => (
                <div key={index}>
                  <Row className="mb-4 mt-2 w-full">
                    <Column className="w-[80px]">
                      {item.image && (
                        <Img
                          src={item.image.startsWith('http') ? item.image : `https://extim.com${item.image}`}
                          alt={item.name}
                          width="70"
                          height="70"
                          className="rounded-lg object-cover border border-gray-200 bg-white"
                        />
                      )}
                    </Column>
                    <Column className="ps-4 align-top">
                      <Text className="text-base font-bold text-gray-900 m-0 mb-1">
                        {item.name}
                      </Text>
                      {item.variantName && (
                        <Text className="text-sm text-gray-500 m-0 mb-2">
                          مدل: {item.variantName}
                        </Text>
                      )}
                      <Text className="text-sm font-bold text-violet-600 m-0">
                        {new Intl.NumberFormat('fa-IR').format(item.price)} تومان
                      </Text>
                    </Column>
                  </Row>
                  {index < items.length - 1 && <Hr className="border-gray-200 my-4" />}
                </div>
              ))}
            </Section>
            
            {discountCode && (
              <Section className="bg-amber-50 rounded-xl p-5 mb-6 text-center border border-amber-100 border-dashed">
                <Text className="text-amber-800 text-base font-bold m-0 mb-2">
                  یک هدیه ویژه برای بازگشت شما! 🎁
                </Text>
                <Text className="text-amber-700 text-sm m-0 mb-4">
                  با استفاده از کد تخفیف زیر، خرید خود را با {discountPercent}٪ تخفیف اختصاصی نهایی کنید.
                </Text>
                <div className="bg-white px-4 py-2 rounded-lg border border-amber-200 inline-block">
                  <Text className="font-mono text-lg font-bold text-amber-600 m-0 tracking-widest">
                    {discountCode}
                  </Text>
                </div>
              </Section>
            )}
            
            <Section className="text-center mb-8 mt-2">
              <Button
                href={checkoutUrl}
                className="bg-amber-500 text-white font-bold px-8 py-3.5 rounded-xl text-base w-auto inline-block"
              >
                تکمیل خرید و پرداخت
              </Button>
            </Section>
            
            <Hr className="border-gray-200 my-6" />
            
            <Text className="text-gray-400 text-xs leading-5 text-center">
              شما این ایمیل را به این دلیل دریافت کرده‌اید که محصولاتی را در سبد خرید خود در فروشگاه اکستیم رها کرده‌اید.
              <br />
              تیم پشتیبانی اکستیم
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AbandonedCartEmail;
