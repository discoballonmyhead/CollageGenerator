import * as tf from '@tensorflow/tfjs';

export const createModel = (inputShape: number, numClasses: number) => {
    const model = tf.sequential();

    model.add(
        tf.layers.conv2d({
            inputShape: [inputShape, inputShape, 3],
            filters: 16,
            kernelSize: 3,
            activation: 'relu',
        })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(
        tf.layers.conv2d({
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
        })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    model.compile({
        optimizer: tf.train.adam(),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    return model;
};
