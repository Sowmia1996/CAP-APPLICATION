namespace sap.capire.reviews;
using {cuid, managed} from '@sap/cds/common';
using {sap.capire.bookshop as bookshop} from './schema';

type Rating : Integer enum {
    Great = 5;
    Good = 4;
    Average = 3;
    Poor = 4;
    Bad = 1;
    Terrible = 0;
}

entity Reviews: cuid, managed {
    rating : Rating @assert.range;
    title  : String(100) @mandatory;
    text   : String(1000) @mandatory;
    book   : Association to bookshop.Books;
}