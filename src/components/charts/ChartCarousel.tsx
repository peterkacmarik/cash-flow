import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface ChartCarouselProps {
    charts: React.ReactNode[];
}

export default function ChartCarousel({ charts }: ChartCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const screenWidth = Dimensions.get('window').width;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / screenWidth);
        setActiveIndex(index);
    };

    const renderChart = ({ item }: { item: React.ReactNode }) => (
        <View style={[styles.chartContainer, { width: screenWidth }]}>
            {item}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={charts}
                renderItem={renderChart}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(_, index) => `chart-${index}`}
                decelerationRate="fast"
                snapToAlignment="center"
            />
            <View style={styles.paginationContainer}>
                {charts.map((_, index) => (
                    <View
                        key={`dot-${index}`}
                        style={[
                            styles.dot,
                            index === activeIndex && styles.activeDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        // Add top padding so charts are not stuck to the top tabs
        paddingTop: 20,
    },
    chartContainer: {
        paddingHorizontal: 20,
        // Ensure space between chart and pagination dots matches pagination padding
        marginBottom: 0,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // Equal vertical spacing above and below the dots (matches paddingTop)
        paddingVertical: 0,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#bdc3c7',
        marginHorizontal: 4,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3498db',
    },
});
