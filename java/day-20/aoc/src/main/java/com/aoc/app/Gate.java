package com.aoc.app;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Gate {
    public static final int BUTTON = 0;
    public static final int BROADCASTER = 1;
    public static final int CONJUNCTION = 2;
    public static final int FLIP_FLOP = 3;

    Map<String, Integer> inputValues = new HashMap<>();
    List<Gate> outputs = new ArrayList<>();
    public final String name;
    public int type;

    public int state = Pulse.LOW;

    public Gate(String name, int type) {
        this.name = name;
        this.type = type;
    }

    public Gate(String name) {
        this.name = name;
    }

    public void addOutput(Gate output) {
        outputs.add(output);
    }

    public void addInput(Gate input) {
        inputValues.put(input.name, Pulse.LOW);
    }

    public List<Pulse> processPulse(Pulse pulse) {
        List<Pulse> pulses = new ArrayList<>();
        boolean sendPulse = false;
        switch (type) {
            case BUTTON:
                sendPulse = updateButtonState();
                break;
            case BROADCASTER:
                sendPulse = updateBroadcasterState(pulse);
                break;
            case CONJUNCTION:
                sendPulse = updateConjunctionState(pulse);
                break;
            case FLIP_FLOP:
                sendPulse = updateFlipFlopState(pulse);
                break;
        }
        if (sendPulse) {
            for (Gate output : outputs) {
                pulses.add(new Pulse(this, output, this.state));
            }
        }
        return pulses;
    }

    private boolean updateButtonState() {
        this.state = Pulse.LOW;
        return true;
    }

    private boolean updateBroadcasterState(Pulse pulse) {
        this.state = pulse.value;
        return true;
    }

    private boolean updateFlipFlopState(Pulse pulse) {
        if (pulse.value == Pulse.LOW) {
            state = state == Pulse.HIGH ? Pulse.LOW : Pulse.HIGH;
            return true;
        }
        return false;
    }

    private boolean updateConjunctionState(Pulse pulse) {
        inputValues.put(pulse.source.name, pulse.value);
        int outputValue = Pulse.HIGH;

        boolean allInputsHigh = true;
        for (int value : inputValues.values()) {
            if (value != Pulse.HIGH) {
                allInputsHigh = false;
                break;
            }
        }

        if (allInputsHigh) {
            outputValue = Pulse.LOW;
        }
        this.state = outputValue;
        return true;
    }
}
