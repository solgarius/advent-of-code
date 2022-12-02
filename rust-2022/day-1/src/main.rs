use std::env;
use std::error::Error;
use std::ffi::OsString;
use std::fs::File;
use std::process;
use std::io::{self, BufRead};
use std::path::Path;

fn run() -> Result<(), Box<dyn Error>> {
    let file_path = get_first_arg()?;
    let lines = read_lines(file_path)?;
    let mut elves: [i32; 500] = [0; 500];
    let mut current_elf = 0;
    for line in lines {
        let valid_line = line?;
        if valid_line.chars().count() > 0 {
            let value: i32 = valid_line.parse().unwrap();
            elves[current_elf] += value;
            // println!("{}", value);
        } else {
            current_elf += 1;
        }
    }
    elves.sort();
    println!("{}", elves[elves.len()-1]);
    println!("{}", elves[elves.len()-1] + elves[elves.len()-2] + elves[elves.len()-3]);
    // for elf in elves {
    //     if elf > 0 {
    //     println!("{}", elf);
    //     }
    // }
    Ok(())
}

// The output is wrapped in a Result to allow matching on errors
// Returns an Iterator to the Reader of the lines of the file.
fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where P: AsRef<Path>, {
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

/// Returns the first positional argument sent to this process. If there are no
/// positional arguments, then this returns an error.
fn get_first_arg() -> Result<OsString, Box<dyn Error>> {
    match env::args_os().nth(1) {
        None => Err(From::from("expected 1 argument, but got none")),
        Some(file_path) => Ok(file_path),
    }
}

fn main() {
    if let Err(err) = run() {
        println!("{}", err);
        process::exit(1);
    }
}