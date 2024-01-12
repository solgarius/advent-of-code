package com.aoc.app;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class InputFile {
    List<Race> races = new ArrayList<>();
    Race grandRace = null;

    public InputFile(String filepath) {
        try {
            List<String> lines = Files.readAllLines(Paths.get(filepath));

            List<List<Double>> numberLists = new ArrayList<>(); // List of number lists
            List<Double> fullNumbers = new ArrayList<>(); // List of full numbers

            for (String line : lines) {
                String[] parts = line.split(":");
                String[] numbers = parts[1].split(" ");
                double fullNumber = Double.parseDouble(parts[1].replaceAll("\\s", ""));
                fullNumbers.add(fullNumber);

                // Remove empty values from numbers array
                List<Double> numberList = new ArrayList<>();
                for (String number : numbers) {
                    if (!number.isEmpty()) {
                        numberList.add(Double.parseDouble(number));
                    }
                }

                numberLists.add(numberList); // Add numberList to the list of number lists
            }
            List<Double> times = numberLists.get(0);
            List<Double> records = numberLists.get(1);

            List<Race> races = new ArrayList<>(); // List of races

            // Iterate through times and match up with records
            for (int i = 0; i < times.size(); i++) {
                double time = times.get(i);
                double record = records.get(i);
                Race race = new Race(time, record);
                races.add(race);
            }

            this.races = races; // Assign races to the instance variable

            this.grandRace = new Race(fullNumbers.get(0), fullNumbers.get(1));

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<Race> getRaces(){
        return this.races;
    }

    public Race getGrandRace(){
        return this.grandRace;
    }
}
