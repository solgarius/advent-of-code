package com.aoc.app;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class InputFile {
    Map<String, Gate> gates = new HashMap<>();

    public InputFile(String filepath) {
        try {
            List<String> lines = Files.readAllLines(Paths.get(filepath));
            for (String line : lines) {
                parseLine(line);
            }
            gates.put("button", new Gate("button", Gate.BUTTON));
            gates.get("button").addOutput(gates.get("broadcaster"));
            gates.get("broadcaster").addInput(gates.get("button"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Map<String, Gate> getGates() {
        return gates;
    }

    private void parseLine(String line) {
        String[] parts = line.split(" -> ");
        String name = parts[0];
        int type = Gate.BROADCASTER;
        if(name.charAt(0) == '%'){
            type = Gate.FLIP_FLOP;
            name = name.substring(1);
        } else if(name.charAt(0) == '&'){
            type = Gate.CONJUNCTION;
            name = name.substring(1);
        }
        
        if(!gates.containsKey(name)){
            gates.put(name, new Gate(name, type));
        }
        Gate gate = gates.get(name);
        gate.type = type; // may have been created as an output of another gate.
        String[] outputs = parts[1].split(", ");
        for (String output : outputs) {
            if(!gates.containsKey(output)){
                gates.put(output, new Gate(output));
            }
            Gate outputGate = gates.get(output);
            gate.addOutput(outputGate);
            outputGate.addInput(gate);
        }
    }
}
