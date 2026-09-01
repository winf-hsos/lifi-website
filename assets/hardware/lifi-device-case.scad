// ============================================================================
//  Optischer Duplex-Demonstrator  --  Gehaeuse
//  Tinkerforge Master Brick 3.x + Color Bricklet 2.0 + RGB LED Bricklet 2.0
//
//  Modul "Digitalisierung und Programmierung"
//  Lizenz: CC0 / Public Domain
//
//  Zwei identische Geraete stehen sich auf dem Tisch gegenueber. LED und
//  Sensor sitzen symmetrisch zur senkrechten Mittelachse -- durch die
//  180-Grad-Drehung des Gegenuebers steht dann automatisch jeweils eine
//  LED einem Sensor gegenueber.
//
//  ZWEI DRUCKTEILE: Wanne (mit integrierter Front) und Deckel.
//
//  Bricklet-Montage:
//    Die Bricklets sind auf der Rueckseite plan und werden AUSSEN direkt auf
//    die Frontwand geschraubt: M3 von vorne durch die Platine in M3-Muttern.
//    Die Muttern sitzen in senkrechten Kanaelen, die von der Gehaeuseoberkante
//    heruntergefuehrt sind: bei abgenommenem Deckel faellt die Mutter von oben
//    hinein, landet auf einem Absatz hinter der Bohrung und kann sich im
//    Kanal nicht verdrehen. Der Deckel verschliesst den Kanal. Haltenasen
//    links, rechts und oben fuehren die Platine; die Unterkante bleibt bis
//    auf zwei Ecknasen frei, damit das Bricklet-Kabel sauber eingesteckt
//    werden kann. Das Kabel laeuft nach unten durch einen Schlitz.
//
//  Verschraubung:
//    Master Brick: M3-Senkkopf (DIN 965) von unten durch den Boden in
//                  einfache Abstandsbolzen; die Koepfe sitzen buendig in
//                  90-Grad-Senkungen. Stand auf vier Gummifuessen in Mulden.
//    Deckel:       4x M3-Senkkopf von oben (buendig) in M3-Muttern, die von
//                  formen ihr Gewinde direkt in die Dome (Schneidschrauben)
//                  werden. Keine Heat-Set-Einsaetze, keine selbstschneidenden
//                  Gewinde.
//    Bricklets:    je 2x M3 diagonal, von vorne in Muttern (M3 x 8 ideal,
//                  M3 x 12 geht auch und steht innen ca. 5 mm ueber).
//
//  DRUCKHINWEIS Wanne:
//    Offene Seite nach oben drucken. Der Trennsteg ragt waagerecht aus der
//    Frontwand und braucht als einziges Feature Stuetzmaterial -- am besten
//    per Paint-on-Support nur dort. Alles andere druckt stuetzenfrei.
//
// ----------------------------------------------------------------------------
//  Bricklet-Masse aus den KiCad-Quellen von Tinkerforge
//  (github.com/Tinkerforge/{color-v2,rgb-led-v2}-bricklet, hardware/*.kicad_pcb),
//  bestaetigt durch die Bohrplaene der Dokumentation.
//
//                         Color Bricklet 2.0    RGB LED Bricklet 2.0
//    Platine              25 x 20 mm            25 x 20 mm
//    Bohrungen (4 Ecken)  +/-10 / +/-7,5 mm     +/-10 / +/-7,5 mm   (Ø 3,0 mm)
//    Stecker              Mitte Unterkante      Mitte Unterkante
//    optisches Bauteil    2,4 mm ueber Mitte    6,6 mm ueber Mitte
//
//  ACHTUNG: Sensor und LED sitzen NICHT gleich hoch auf ihren Platinen
//  (4,2 mm Unterschied). Bei achsen_ausrichten = true wird die LED-Platine
//  entsprechend tiefer gesetzt, damit die optischen Achsen fluchten.
//
//  VOR DEM ERSTEN DRUCK PRUEFEN:
//    brick_loch  - Lochabstand des Master Brick
//    usb_z       - Hoehe der USB-C-Buchsenmitte (Default wird berechnet)
//
//  Druckempfehlung:
//    schwarzes, mattes Filament (PETG oder PLA), 0,2 mm Schicht,
//    mindestens 4 Perimeter.
// ============================================================================


/* [Auswahl] --------------------------------------------------------------- */
teil = "alle"; // [wanne,deckel,testcoupon,alle]

$fn = 64;
sp  = 0.3;              // allgemeines Passungsspiel


/* [Gehaeuse] -------------------------------------------------------------- */
innen_b  = 70;          // Innenbreite (X)
innen_t  = 66;          // Innentiefe  (Y)
innen_h  = 35;          // Innenhoehe  (Z) -- Mindestwert nennt die Console
wand     = 2.4;         // Seiten- und Rueckwand
front_d  = 3.0;         // Frontwand (traegt die Bricklets)
boden    = 2.4;
deckel_d = 2.4;


/* [Master Brick] ---------------------------------------------------------- */
bolzen_unten = 10;      // einfache Abstandsbolzen, Boden -> Master Brick
brick_pcb    = 1.6;
brick_loch   = 35;      // Lochabstand des Master Brick, 35 x 35 mm laut
                        // Tinkerforge-Masszeichnung (Platine 40 x 40, Ø 3,0);
                        // Testdruck vom 26.08.2026 hatte faelschlich 32.
brick_y      = 10;      // Versatz des Bricks nach hinten


/* [Optik] ----------------------------------------------------------------- */
achsabstand = 34;       // Abstand LED-Achse <-> Sensor-Achse
septum_vor  = 30;       // Ueberstand des Trennstegs ab Frontwand
                        // (die Bricklets stehen selbst ca. 5 mm vor)
septum_d    = 3.0;

// Versatz des optischen Bauteils ueber der Platinenmitte (aus den KiCad-Daten).
// Horizontal sitzen beide Bauteile mittig, deshalb nur ein Wert in Z.
optik_v_led    = 6.6;   // RGB LED Bricklet 2.0
optik_v_sensor = 2.4;   // Color Bricklet 2.0

// true  = optische Achsen auf gleicher Hoehe (Platinen versetzt montiert)
// false = Platinenmitten auf gleicher Hoehe, Achsen 4,2 mm versetzt
achsen_ausrichten = true;


/* [Bricklets] ------------------------------------------------------------- */
bl_b = 25;              // Bricklet-Breite (X)
bl_h = 20;              // Bricklet-Hoehe  (Z)

// Lochbild: vier Bohrungen in den Ecken, von der Platinenmitte aus gemessen.
bl_loch_dx = 10;        // halber Lochabstand in X (25-mm-Achse)
bl_loch_dz = 7.5;       // halber Lochabstand in Z (20-mm-Achse)

// Zwei diagonal gegenueberliegende Schrauben reichen zum Halten.
alle_loecher = false;   // true = alle vier Ecken bohren
diagonale    = 1;       // 1 = links unten + rechts oben, -1 = andere Diagonale

bl_loecher = alle_loecher
    ? [for (ex = [-1, 1], ez = [-1, 1]) [ex * bl_loch_dx, ez * bl_loch_dz]]
    : [[-bl_loch_dx, -diagonale * bl_loch_dz],
       [ bl_loch_dx,  diagonale * bl_loch_dz]];

// Mutternkanaele hinter den Bricklet-Bohrungen
// Muttern kommen im Gehaeuse nicht mehr vor, siehe Schraubenblock unten.

// Haltenasen
// Eigenes Spiel fuer den Platinensitz: Mit dem allgemeinen sp (0,3 mm
// gesamt) sassen die Bricklets beim ersten Testdruck (26.08.2026) nur mit
// Druck; 0,6 mm gesamt (0,3 je Seite) laesst sie ohne Druck einsetzen,
// gefuehrt werden sie weiterhin von den Nasen auf allen vier Seiten.
bl_sp      = 0.6;
nase_b     = 2.5;       // Breite (steht neben der Platine)
nase_h     = 2.0;       // Hoehe ueber der Wandflaeche (Platine 1,6 mm)
nase_l     = 8;         // Laenge der Nasen links/rechts/oben
nase_unten = true;      // kurze Ecknasen an der Unterkante
nase_l_u   = 5;         // deren Laenge


/* [Kabeldurchfuehrung] ---------------------------------------------------- */
kabel_b    = 13;        // Breite des Schlitzes; war 12, +1 mm nach dem ersten
                        // Testdruck (27.08.2026): Das Bricklet-Kabel musste
                        // zu eng gebogen werden. Die unteren Ecknasen sind
                        // dafuer 0,5 mm nach aussen gerueckt, siehe nasen().
kabel_h    = 4;         // Hoehe  des Schlitzes
kabel_luft = 1;         // Abstand Schlitzoberkante <-> Platinenunterkante


/* [USB-C und Taster] ------------------------------------------------------ */
// Schlitz ueber die volle Breite des Master Brick (40 mm + 1 mm Spiel je
// Seite): An derselben Kante wie die USB-C-Buchse sitzen links und rechts
// die seitlich betaetigten Taster Reset und Erase, die erreichbar bleiben
// sollen (Nutzerwunsch nach dem ersten Testdruck, 27.08.2026).
// Druckhinweis: Die Schlitzoberkante ist eine ca. 42 mm lange Bruecke in
// der Rueckwand; uebliche Bridging-Einstellungen reichen, sonst Stuetze.
usb_b = 42;
usb_h =  9;
usb_z = boden + bolzen_unten + brick_pcb + 1.6;   // TODO nachmessen


/* [Unterseite] ------------------------------------------------------------ */
// Der Master Brick wird mit M3-SENKKOPF-Schrauben (DIN 965) von unten
// verschraubt; die Bodenbohrungen tragen eine 90-Grad-Senkung, die Koepfe
// schliessen buendig ab. Fuer den Stand sorgen vier Klebe-Gummifuesse
// (Ø 10 mm) in flachen Mulden nahe den Ecken: Die Mulde haelt den Fuss
// formschluessig gegen seitliches Abscheren und zeigt beim Bestücken, wohin
// er gehoert. Entschieden am 27.08.2026 nach dem ersten Testdruck.
senk_d    = 6.5;        // Senkungsdurchmesser (Kopf DIN 965: 5,6-6,0 + Spiel)
fuss_d    = 10;         // Durchmesser der Gummifuesse
fuss_tiefe = 0.6;       // Muldentiefe; der Fuss steht 1-2 mm darueber
fuss_rand  = 9;         // Abstand Fussmitte <-> Aussenkante des Gehaeuses


/* [Schrauben] ------------------------------------------------------------- */
m3_frei = 3.4;

// Schrauben, Stand 31.08.2026 nach dem zweiten Testdruck. Die Muttertaschen
// der Vorfassung scheiterten doppelt: In den Deckeldomen blieben
// Slicer-Stuetzreste stecken (waagerechter Hohlraum mitten im Druck wird
// gestuetzt), und die Fronttaschen jagten der Drucker-Toleranz hinterher
// (0,3 mm Spiel zu eng auf Drucker A, 0,5 mm zu weit auf Drucker B: Mutter
// dreht durch bzw. faellt durch). Daher jetzt zweigleisig:
//
// * DECKEL: gewindeformende Kunststoffschrauben 3,0 x 8 (Senkkopf Torx,
//   konkret EJOT Delta PT WN 5454; greift durch den 2,4-mm-Deckel 5,6 mm
//   tief ins 9-mm-Sackloch, das 1,9-fache des Durchmessers.
//   Typ "PT"/"Delta PT" fuer Thermoplaste; KEINE Blechschrauben, deren
//   Gewinde sprengt die Dome). Nur ein Sackloch im massiven Dom, keine
//   Hohlraeume, keine Stuetzen. Grenze ca. 10 bis 20 Schraubzyklen, fuer
//   den selten geoeffneten Deckel reichlich.
// * BRICKLETS: M3-Schraube durch die Frontwand, Mutter von innen von Hand
//   gekontert (Wunsch vom 31.08.2026); Schrauben und Muttern kommen aus dem
//   Tinkerforge-Montagekit. Durchgangsloch wie gehabt, keine Taschen, keine
//   Naben; der Innenraum ist vor dem Deckelschliessen frei zugaenglich.
// * BODEN: M3 x 8 Senkkopf in die 10-mm-Abstandsbolzen (Gewinde beidseitig
//   innen) aus dem Tinkerforge-Montagekit; bolzen_unten = 10 passt dazu.
dom_d        = 8;
schneid_kern = 2.5;     // Kernloch fuer die 3,0er-Schneidschraube
dom_gewinde  = 9;       // Gewindetiefe im Dom (Sackloch von oben)

// Abstand der vorderen Deckeldome von der Frontinnenwand: laesst Platz fuer
// Finger und Mutter beim Kontern der Bricklet-Schrauben.
front_frei = 4.5;


/* [Abgeleitete Groessen] -------------------------------------------------- */
b_out   = innen_b + 2 * wand;
t_out   = front_d + innen_t + wand;
y_front = -t_out / 2;               // Aussenflaeche der Frontwand
y_cav   = y_front + front_d;        // Innenflaeche der Frontwand
y_back  = y_cav + innen_t;          // Innenflaeche der Rueckwand
h_wanne = boden + innen_h;

// Bodenbohrungen fuer die Abstandsbolzen = Lochbild des Master Brick
brick_pos = [for (sx = [-1, 1], sy = [-1, 1])
                [sx * brick_loch / 2, brick_y + sy * brick_loch / 2]];

// Mulden fuer die Gummifuesse, nahe den vier Ecken der Bodenplatte
fuss_pos = [for (sx = [-1, 1], sy = [-1, 1])
               [sx * (b_out / 2 - fuss_rand),
                sy > 0 ? y_front + t_out - fuss_rand : y_front + fuss_rand]];

// Deckel-Schraubdome in den vier Innenecken
dom_x   = innen_b / 2 - dom_d / 2;
// [x, y, beruehrt auch die Rueckwand?]
// Die vorderen Dome sind nach hinten gerueckt, damit ihre Bohrungen nicht in
// die Mutternrippen laufen -- sie liegen daher nur an der Seitenwand an.
dom_pos = [[-dom_x, y_cav + front_frei + dom_d / 2 + 2, false],
           [ dom_x, y_cav + front_frei + dom_d / 2 + 2, false],
           [-dom_x, y_back - dom_d / 2,              true ],
           [ dom_x, y_back - dom_d / 2,              true ]];

dom_anb = 7;            // Laenge der Anbindung in die Wand. 16 mm waren
                        // unnoetig wuchtig (Nutzerfrage 31.08.2026); zum
                        // Verschmelzen der Slicer-Bahnen reicht knapp Domdicke.

// Versatz der Platinenmitte gegenueber der optischen Achse
dv_led    = achsen_ausrichten ? optik_v_led    : 0;
dv_sensor = achsen_ausrichten ? optik_v_sensor : 0;
dv_max    = max(dv_led, dv_sensor);
dv_min    = min(dv_led, dv_sensor);

// Hoehe der optischen Achse: so tief wie moeglich, aber so, dass unter der
// tiefstsitzenden Platine noch der Kabelschlitz Platz hat.
optik_z = boden + sp + kabel_h + kabel_luft + bl_h / 2 + dv_max + 1;

x_led    =  achsabstand / 2;
x_sensor = -achsabstand / 2;

// Bricklets als [x-Mitte, z-Mitte der Platine]
bricklets = [[x_led,    optik_z - dv_led],
             [x_sensor, optik_z - dv_sensor]];

// Trennsteg deckt beide Platinen ab
sept_u = optik_z - dv_max - bl_h / 2 - 1;
sept_o = min(optik_z - dv_min + bl_h / 2 + 1, h_wanne);


/* [Plausibilitaetspruefung] ----------------------------------------------- */
noetig = optik_z - dv_min + bl_h / 2 + 1 + nase_b - boden;
echo(str("Innenhoehe: ", innen_h, " mm   noetig: ", noetig, " mm"));
echo(str("Optische Achse ueber Tisch: ", optik_z, " mm"));
echo(str("Aussenmasse B x T x H: ", b_out, " x ", t_out,
         " x ", h_wanne + deckel_d, " mm (ohne Trennsteg)"));
if (innen_h < noetig)
    echo("WARNUNG: innen_h zu gering fuer die Bricklets.");
if (achsabstand - bl_b < septum_d + 4)
    echo("WARNUNG: zu wenig Platz zwischen den Platinen fuer den Trennsteg.");


// ============================================================================
//  Wanne mit integrierter Frontwand
// ============================================================================
module wanne() {
    difference() {
        union() {
            // Schale: Vollkoerper minus Innenraum
            difference() {
                translate([-b_out / 2, y_front, 0])
                    cube([b_out, t_out, h_wanne]);
                translate([-innen_b / 2, y_cav, boden])
                    cube([innen_b, innen_t, innen_h + 1]);
            }

            // Deckel-Schraubdome, in die angrenzenden Waende eingebunden
            for (p = dom_pos) dom(p);

            // Trennsteg zwischen LED und Sensor
            translate([-septum_d / 2, y_front - septum_vor, sept_u])
                cube([septum_d, septum_vor, sept_o - sept_u]);

            for (b = bricklets)
                nasen(b[0], b[1]);
        }

        // Deckeldome: Kernloch als Sackloch von oben, die Schneidschraube
        // formt sich ihr Gewinde selbst. Kein Hohlraum, keine Stuetzen.
        for (p = dom_pos)
            translate([p[0], p[1], h_wanne - dom_gewinde])
                cylinder(d = schneid_kern, h = dom_gewinde + 1);

        // USB-C-Ausschnitt in der Rueckwand
        translate([-usb_b / 2, y_back - 1, usb_z - usb_h / 2])
            cube([usb_b, wand + 2, usb_h]);

        // Durchgangsloecher fuer die Abstandsbolzen des Master Brick.
        // M3-Senkkopf von unten, die Senkung macht die Koepfe buendig.
        for (p = brick_pos) {
            translate([p[0], p[1], -1])
                cylinder(d = m3_frei, h = boden + 2);
            // 90-Grad-Senkung von der Unterseite
            translate([p[0], p[1], -0.01])
                cylinder(d1 = senk_d, d2 = m3_frei,
                         h = (senk_d - m3_frei) / 2);
        }

        // Mulden fuer die Klebe-Gummifuesse
        for (p = fuss_pos)
            translate([p[0], p[1], -1])
                cylinder(d = fuss_d + 0.4, h = 1 + fuss_tiefe);

        for (b = bricklets) {
            // Kabeldurchfuehrung unterhalb der Platine
            translate([b[0] - kabel_b / 2,
                       y_front - 1,
                       b[1] - bl_h / 2 - kabel_luft - kabel_h])
                cube([kabel_b, front_d + 2, kabel_h]);

            // Durchgangsloch M3: Schraube von vorn, Mutter von innen
            for (l = bl_loecher)
                translate([b[0] + l[0], y_front - 1, b[1] + l[1]])
                    rotate([-90, 0, 0])
                        cylinder(d = m3_frei, h = front_d + 2);
        }
    }
}


// ----------------------------------------------------------------------------
//  Schraubdom, tropfenfoermig in die angrenzenden Waende gezogen.
//  Die Bohrung behaelt einen konzentrischen Materialring -- wichtig, damit die
//  Perimeter des Slicers ringfoermig um das Loch laufen und die Schraube bzw.
//  der Heat-Set-Einsatz nicht quer zu den Extrusionsbahnen aufweitet.
// ----------------------------------------------------------------------------
module dom(p) {
    sx = (p[0] < 0) ? -1 : 1;
    translate([0, 0, boden])
        linear_extrude(height = innen_h)
            hull() {
                translate([p[0], p[1]]) circle(d = dom_d);
                // Anbindung an die Seitenwand
                translate([sx * (innen_b / 2 - 0.5), p[1]])
                    square([1, dom_anb], center = true);
                // Anbindung an die Rueckwand, falls der Dom sie beruehrt
                if (p[2])
                    translate([p[0], y_back - 0.5])
                        square([dom_anb, 1], center = true);
            }
}


// ----------------------------------------------------------------------------
//  Haltenasen um eine Platine herum (Mitte bei xc / zc), aussen an der Front
// ----------------------------------------------------------------------------
module nasen(xc, zc) {
    xk = bl_b / 2 + bl_sp / 2;
    zk = bl_h / 2 + bl_sp / 2;

    for (ex = [-1, 1])
        translate([xc + ex * (xk + nase_b / 2), y_front - nase_h / 2, zc])
            cube([nase_b, nase_h, nase_l], center = true);

    translate([xc, y_front - nase_h / 2, zc + zk + nase_b / 2])
        cube([nase_l, nase_h, nase_b], center = true);

    // unten nur in den Ecken -- die Mitte bleibt fuer Stecker und Kabel frei.
    // 0,5 statt 1 mm nach innen gerueckt, damit zum 13 mm breiten
    // Kabelschlitz ein sauberer Steg bleibt (0,65 mm je Seite).
    if (nase_unten)
        for (ex = [-1, 1])
            translate([xc + ex * (xk - nase_l_u / 2 - 0.5),
                       y_front - nase_h / 2,
                       zc - zk - nase_b / 2])
                cube([nase_l_u, nase_h, nase_b], center = true);
}


// ============================================================================
//  Deckel -- 4x M3 in die Schraubdome
// ============================================================================
module deckel() {
    difference() {
        translate([-b_out / 2, y_front, 0])
            cube([b_out, t_out, deckel_d]);
        for (p = dom_pos) {
            translate([p[0], p[1], -1])
                cylinder(d = m3_frei, h = deckel_d + 2);
            // 90-Grad-Senkung von oben, gleiche Schrauben wie am Boden
            translate([p[0], p[1],
                       deckel_d - (senk_d - m3_frei) / 2])
                cylinder(d1 = m3_frei, d2 = senk_d,
                         h = (senk_d - m3_frei) / 2 + 0.01);
        }
    }
}


// ============================================================================
//  Testcoupon -- Ausschnitt der Frontwand um EIN Bricklet herum.
//  Prueft Lochbild, Gewindetiefe und Sitz der Haltenasen. Ca. 20 min Druck.
// ============================================================================
module testcoupon() {
    intersection() {
        wanne();
        translate([x_sensor, y_front + 60, optik_z - dv_sensor])
            cube([bl_b + 14, 120, bl_h + 24], center = true);
    }
}


// ============================================================================
//  Ausgabe
// ============================================================================
if (teil == "wanne") {
    wanne();

} else if (teil == "deckel") {
    deckel();

} else if (teil == "testcoupon") {
    testcoupon();

} else {                       // "alle" -- Deckel abgehoben
    wanne();
    translate([0, 0, h_wanne + 25]) deckel();
}
