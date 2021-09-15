import * as tf from '@tensorflow/tfjs';
import React from 'react';
import { cameraWithTensors, detectGLCapabilities } from '@tensorflow/tfjs-react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react/cjs/react.development';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as faceLandmarkDetection from '@tensorflow-models/face-landmarks-detection';

const TensorCamera = cameraWithTensors(Camera);

export default function App() {
  const [isTensorReady, setIsTensorReady] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [camReady, setCamReady] = useState(false);

  let textureDims;
  if (Platform.OS === 'ios') {
    textureDims = {
      height: 1920,
      width: 1080,
    };
  } else {
    textureDims = {
      height: 1200,
      width: 1600,
    };
  }

  const loadTensor = async () => {
    await tf.ready();
    console.log('Tensorflow js is loaded!');
    await tf.setBackend('rn-webgl');
    console.log('Tensorflow backend is loaded!');
  };

  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {

      const nextImageTensor = images.next().value;
      await predict(nextImageTensor);

      requestAnimationFrame(loop);
    }
    loop();
  }

  const predict = async (imageTensor) => {
    const model = await faceLandmarkDetection.load(faceLandmarkDetection.SupportedPackages.mediapipeFacemesh);
    console.log('Tensorflow model is loaded!');
    const prediction = await model.estimateFaces({
      input: imageTensor,
    })

    console.log(prediction);
  }

  useEffect(() => {
    //Executed when starting app
    loadTensor();
  }, []);

  useEffect(() => {
    if (camReady === true) {
      console.log('Camera is ready');
    }
    else {
      console.log('Camera is not ready');
    }
  }, [camReady]);

  return (
    <View style={styles.container}>
      <TensorCamera
        style={styles.camera}
        type={Camera.Constants.Type.front}
        onCameraReady={() => setCamReady(true)}
        ratio={'16:9'}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  }
})