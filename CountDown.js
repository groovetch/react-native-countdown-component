import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import moment from 'moment';
import BackgroundTimeout from './BackgroundTimeout';

const DEFAULT_DIGIT_STYLE = { backgroundColor: '#FAB913' };
const DEFAULT_DIGIT_TXT_STYLE = { color: '#000' };
const DEFAULT_TIME_LABEL_STYLE = { color: '#000' };
const DEFAULT_SEPARATOR_STYLE = { color: '#000' };
const DEFAULT_TIME_TO_SHOW = ['D', 'H', 'M', 'S'];
const DEFAULT_TIME_LABELS = {
  d: 'Days',
  h: 'Hours',
  m: 'Minutes',
  s: 'Seconds',
};

const INITIALIZE_DIFF = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalSeconds: 0,
};

function CountDown(props) {
  const { until, useBackgroundTimer, running, onFinish, onChange } = props;
  const untilMoment = useRef(null);
  const secondInterval = useRef(0);
  const [duration, setDuration] = useState(INITIALIZE_DIFF);

  const updateDuration = useCallback(seconds => {
    let diff = INITIALIZE_DIFF;
    if (seconds > 0) {
      const currentMoment = moment(moment().format());
      diff = {
        days: untilMoment.current.diff(currentMoment, 'days'),
        hours: parseInt(seconds / 3600, 10) % 24,
        minutes: parseInt(seconds / 60, 10) % 60,
        seconds: seconds % 60,
        totalSeconds: seconds,
      };
    }
    setDuration(diff);
  }, []);

  React.useEffect(() => {
    if (!until) {
      return;
    }
    untilMoment.current = moment(until);
    const currentMoment = moment(moment().format());
    secondInterval.current = Math.max(0, untilMoment.current.diff(currentMoment, 'seconds'));
    updateDuration(secondInterval.current);
  }, [until]);

  const renderSeparator = () => {
    const { separatorStyle, size } = props;
    return (
      // eslint-disable-next-line react-native/no-inline-styles
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={[
            styles.separatorTxt,
            { fontSize: size * 1.2 },
            separatorStyle,
          ]}>
          {':'}
        </Text>
      </View>
    );
  };

  const renderLabel = label => {
    const { timeLabelStyle, size } = props;
    if (label) {
      return (
        <Text
          style={[styles.timeTxt, { fontSize: size / 1.8 }, timeLabelStyle]}>
          {label}
        </Text>
      );
    }
  };

  const renderDigit = (d, label) => {
    const { digitStyle, digitTxtStyle, size } = props;
    return (
      <View
        style={[
          styles.digitCont,
          { width: size * 2.3, height: size * 2.6 },
          digitStyle,
        ]}>
        <Text style={[styles.digitTxt, { fontSize: size }, digitTxtStyle]}>
          {d}
        </Text>
        {renderLabel(label)}
      </View>
    );
  };

  const renderDoubleDigits = (label, digits) => {
    return (
      <View style={styles.doubleDigitCont}>
        <View style={styles.timeInnerCont}>{renderDigit(digits, label)}</View>
      </View>
    );
  };

  const renderCountDown = () => {
    const { timeToShow, timeLabels, showSeparator } = props;
    const newTime = [
      ('0' + duration.days).slice(-2),
      ('0' + duration.hours).slice(-2),
      ('0' + duration.minutes).slice(-2),
      ('0' + duration.seconds).slice(-2),
    ];
    const Component = props.onPress ? TouchableOpacity : View;
    return (
      <Component style={styles.timeCont} onPress={props.onPress}>
        {timeToShow.includes('D')
          ? renderDoubleDigits(timeLabels.d, newTime[0])
          : null}
        {showSeparator && timeToShow.includes('D') && timeToShow.includes('H')
          ? renderSeparator()
          : null}
        {timeToShow.includes('H')
          ? renderDoubleDigits(timeLabels.h, newTime[1])
          : null}
        {showSeparator && timeToShow.includes('H') && timeToShow.includes('M')
          ? renderSeparator()
          : null}
        {timeToShow.includes('M')
          ? renderDoubleDigits(timeLabels.m, newTime[2])
          : null}
        {showSeparator && timeToShow.includes('M') && timeToShow.includes('S')
          ? renderSeparator()
          : null}
        {timeToShow.includes('S')
          ? renderDoubleDigits(timeLabels.s, newTime[3])
          : null}
      </Component>
    );
  };

  return (
    <View style={props.style}>
      {running && (
        <BackgroundTimeout
          useBackgroundTimer={useBackgroundTimer}
          seconds={secondInterval.current}
          onFinish={onFinish}
          onChange={seconds => {
            updateDuration(seconds);
            if (typeof onChange === 'function') {
              onChange(seconds);
            }
          }}
        />
      )}
      {renderCountDown()}
    </View>
  );
}

CountDown.defaultProps = {
  digitStyle: DEFAULT_DIGIT_STYLE,
  digitTxtStyle: DEFAULT_DIGIT_TXT_STYLE,
  timeLabelStyle: DEFAULT_TIME_LABEL_STYLE,
  timeLabels: DEFAULT_TIME_LABELS,
  separatorStyle: DEFAULT_SEPARATOR_STYLE,
  timeToShow: DEFAULT_TIME_TO_SHOW,
  showSeparator: false,
  until: null,
  size: 15,
  running: true,
  useBackgroundTimer: false,
};

CountDown.propTypes = {
  id: PropTypes.string,
  useBackgroundTimer: PropTypes.bool,
  digitStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  digitTxtStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  timeLabelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  separatorStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  timeToShow: PropTypes.array,
  showSeparator: PropTypes.bool,
  size: PropTypes.number,
  until: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func,
  onFinish: PropTypes.func,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeTxt: {
    color: 'white',
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  timeInnerCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitCont: {
    borderRadius: 5,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doubleDigitCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitTxt: {
    color: 'white',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  separatorTxt: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
  },
});

export default CountDown;
export { CountDown };
