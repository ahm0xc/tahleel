import * as React from "react";

import { type LayoutChangeEvent, ScrollView, View } from "react-native";

type GridViewProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  paddingHorizontal?: number;
  gap?: number;
  numColumns?: number;
};

const GridView = <T,>({
  data,
  renderItem,
  paddingHorizontal = 0,
  gap = 16,
  numColumns = 2,
}: GridViewProps<T>) => {
  const [containerWidth, setContainerWidth] = React.useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const availableWidth = containerWidth - paddingHorizontal * 2;
  const itemSize =
    containerWidth > 0
      ? (availableWidth - gap * (numColumns - 1)) / numColumns
      : 0;

  return (
    <ScrollView
      onLayout={handleLayout}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap,
        }}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={{
              width: itemSize,
              height: itemSize,
            }}
          >
            {renderItem(item, index)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default GridView;
