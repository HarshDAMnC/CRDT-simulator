#include "CRDTEditor.hpp"
#include "MessageBus.hpp"
#include <iostream>
#include <string>

#ifdef _WIN32
#include <conio.h>
#else
#include <termios.h>
#include <unistd.h>
#endif

// Cross-platform raw terminal input
int getch() {
#ifdef _WIN32
    return _getch();
#else
    int buf = 0;
    struct termios old = {0};
    if (tcgetattr(0, &old) < 0) perror("tcsetattr()");
    old.c_lflag &= ~ICANON;
    old.c_lflag &= ~ECHO;
    old.c_cc[VMIN] = 1;
    old.c_cc[VTIME] = 0;
    if (tcsetattr(0, TCSANOW, &old) < 0) perror("tcsetattr ICANON");
    if (read(0, &buf, 1) < 0) perror ("read()");
    old.c_lflag |= ICANON;
    old.c_lflag |= ECHO;
    if (tcsetattr(0, TCSADRAIN, &old) < 0) perror ("tcsetattr ~ICANON");
    return buf;
#endif
}

void clearScreen() {
#ifdef _WIN32
    std::system("cls");
#else
    std::system("clear");
#endif
}

// Renders string with a visible cursor block [ ] at the exact index
std::string renderWithCursor(const std::string& text, int cursorPos, bool isActive) {
    if (!isActive) return text;
    
    std::string res = text;
    // Cap cursor to string bounds
    if (cursorPos < 0) cursorPos = 0;
    if (cursorPos > res.size()) cursorPos = res.size();

    // Insert an ASCII block at the cursor position
    res.insert(cursorPos, "█");
    return res;
}

void renderUI(CRDTEditor& editor1, CRDTEditor& editor2, int activeUser, int cursor1, int cursor2) {
    clearScreen();
    std::cout << "===========================================================\n";
    std::cout << "     CRDT Collaborative Terminal (Google Docs Style)    \n";
    std::cout << "===========================================================\n\n";
    
    std::string doc1 = editor1.getDocument();
    std::string doc2 = editor2.getDocument();

    if (activeUser == 1) {
        std::cout << "-> [User 1 (Active)] \n";
        std::cout << "   " << renderWithCursor(doc1, cursor1, true) << "\n\n";
        std::cout << "   [User 2 (Idle)] \n";
        std::cout << "   " << doc2 << "\n";
    } else {
        std::cout << "   [User 1 (Idle)] \n";
        std::cout << "   " << doc1 << "\n\n";
        std::cout << "-> [User 2 (Active)] \n";
        std::cout << "   " << renderWithCursor(doc2, cursor2, true) << "\n";
    }

    std::cout << "\n-----------------------------------------------------------\n";
    std::cout << "Controls:\n";
    std::cout << " [Arrow Keys] : Move Cursor Left / Right\n";
    std::cout << " [Letters]    : Insert exactly at cursor (pushes text right)\n";
    std::cout << " [Backspace]  : Delete character behind cursor\n";
    std::cout << " [TAB]        : Switch Users (Simulate network collab)\n";
    std::cout << " [ESC]        : Exit\n";
}

int main() {
    MessageBus network;
    CRDTEditor editor1(1, network);
    CRDTEditor editor2(2, network);

    int activeUser = 1; 
    int cursor1 = 0;
    int cursor2 = 0;
    
    while (true) {
        // Enforce boundary safety dynamically before rendering
        cursor1 = std::min(cursor1, (int)editor1.getDocument().size());
        cursor2 = std::min(cursor2, (int)editor2.getDocument().size());
        cursor1 = std::max(cursor1, 0);
        cursor2 = std::max(cursor2, 0);

        renderUI(editor1, editor2, activeUser, cursor1, cursor2);

        int c = getch();

        if (c == 27) { // ESC key or Escape Sequence Start
#ifndef _WIN32
            // On Unix, arrow keys are 3-byte escape sequences: ESC [ A/B/C/D
            int next1 = getch();
            if (next1 == '[') {
                int next2 = getch();
                int& cPos = (activeUser == 1) ? cursor1 : cursor2;
                if (next2 == 'C') cPos++; // Right
                else if (next2 == 'D') cPos--; // Left
                continue;
            } else {
                break; // Just ESC was pressed
            }
#else
            break;
#endif
        } 
#ifdef _WIN32
        // Windows special keys (Arrows)
        else if (c == 224) { 
            int next = getch();
            int& cPos = (activeUser == 1) ? cursor1 : cursor2;
            if (next == 77) cPos++; // Right
            else if (next == 75) cPos--; // Left
            continue;
        }
#endif
        else if (c == '\t') { 
            activeUser = (activeUser == 1) ? 2 : 1;
        } 
        else if (c == '\b' || c == 127) { 
            CRDTEditor& active = (activeUser == 1) ? editor1 : editor2;
            int& cPos = (activeUser == 1) ? cursor1 : cursor2;
            
            if (cPos > 0) {
                // Delete logically at the exact index before cursor
                active.deleteChar(cPos - 1);
                cPos--; // Move cursor back visually
            }
        } 
        else if (c >= 32 && c <= 126) { 
            CRDTEditor& active = (activeUser == 1) ? editor1 : editor2;
            int& cPos = (activeUser == 1) ? cursor1 : cursor2;
            
            // The CRDT magic! Insert anywhere.
            active.typeChar(cPos, (char)c);
            cPos++; // Shift cursor forward visually
        }
    }

    clearScreen();
    std::cout << "Exiting Editor...\n";
    return 0;
}
