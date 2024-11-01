import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from "docx";
import { Toolbar } from "primereact/toolbar";
import { InputIcon } from "primereact/inputicon";
import { IconField } from "primereact/iconfield";
import "./LettersTable.css";

const Relationships = ({ nodeData, handleNodeClick }) => {
  const nodeId = nodeData.data.person.personID;

  const fetchNodeData = async (id) => {
    console.log(id);
    try {
      const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL || "http://localhost:4000/";
      const url = `${baseExpressUrl}person/${id}`; // Corrected URL path
      const dataResponse = await fetch(url);
      if (dataResponse.ok) {
        return await dataResponse.json();
      } else {
        console.error("Person not found or server returned an error.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchFullName = async (id) => {
    try {
      const baseExpressUrl = process.env.REACT_APP_BASEEXPRESSURL || "http://localhost:4000/";
      const url = `${baseExpressUrl}personFullName/${id}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.fullName;
      } else {
        console.error("Full name not found or server returned an error.");
      }
    } catch (error) {
      console.error("Error fetching full name:", error);
    }
  };

  const [relationships, setRelationships] = useState([]);
  useEffect(() => {
    const fetchFullNames = async () => {
      if (nodeData.relations) {
        const updatedRelations = await Promise.all(
          nodeData.relations.map(async (relation) => {
            const personId =
              relation.person1ID === nodeId
                ? relation.person2ID
                : relation.person1ID;
            const fullName = await fetchFullName(personId);
            return { ...relation, person: { fullName } };
          })
        );
        setRelationships(updatedRelations);
        setFilteredData(updatedRelations);
      }
    };
    fetchFullNames();
  }, [nodeData]);

  const handleItemClick = async (e) => {
    console.log(e.data);
    var personId;
    if (e.data.person1ID === nodeId) {
      personId = e.data.person2ID;
    } else {
      personId = e.data.person1ID;
    }

    // Wait for the node data to be fetched
    const fetchedData = await fetchNodeData(personId);
    const documents = fetchedData.documents.map((doc) => ({ document: doc })); // Transform documents
    const person = fetchedData.person;
    const religion = fetchedData.religion;
    const mentions = fetchedData.mentions;
    const relations = fetchedData.relationships;

    // Organize the fetched data
    const data = {
      person: person,
      documents: documents, // Transform documents
      religion: religion,
      mentions: mentions,
      relations: relationships,
    };
    // Safely check if firstName and lastName exist before destructuring
    const { firstName = "", lastName = "" } = data.person || {};

    // Create the fullName if either firstName or lastName exist
    if (firstName || lastName) {
      data.person.fullName = `${firstName} ${lastName}`.trim();
    } else {
      // Handle the case where the name fields don't exist
      data.person.fullName = "No Name Available";
    }

    const node = { data, person, documents, religion, mentions, relations };
    console.log(node);
    handleNodeClick(node);
  };

  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState(null); // Add filter state
  const [filteredData, setFilteredData] = useState([]); // Add filtered data state
  const dt = useRef(null);

  // Function to retrieve filtered data from the table
  const getFilteredData = () => {
    return filteredData;
  };

  // Download table data as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Name",
      "Relationship",
      "Relationship2",
      "Started",
      "Ended",
      "End reason",
    ];
    const tableRows = [];

    console.log(filteredData);
    getFilteredData().forEach((doc) => {
      const docData = [
        doc.person?.fullName || null,
        doc.relationship1to2Desc || null,
        doc.relationship2to1Desc || null,
        doc.dateStart || null,
        doc.dateEnd || null,
        doc.dateEndCause || null,
      ];
      tableRows.push(docData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Document Table", 14, 15);
    doc.save("table.pdf");
  };

  // Download table data as Excel
  const downloadExcel = () => {
    const filteredData = getFilteredData().map((doc) => ({
      Name: doc.person?.fullName || "Person not found",
      Relationship: doc.relationship1to2Desc || "Relationship not found",
      Relationship2: doc.relationship2to1Desc || "Relationship not found",
      Started: doc.dateStart || "Date not found",
      Ended: doc.dateEnd || "Date not found",
      EndReason: doc.dateEndCause || "Date not found",
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "table.xlsx");
  };

  // Download table data as Word
  const downloadWord = () => {
    const table = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Name")] }),
            new TableCell({ children: [new Paragraph("Relationship")] }),
            new TableCell({ children: [new Paragraph("Relationship2")] }),
            new TableCell({ children: [new Paragraph("Started")] }),
            new TableCell({ children: [new Paragraph("Ended")] }),
            new TableCell({ children: [new Paragraph("End Reason")] }),
          ],
        }),
        ...getFilteredData().map(
          (doc) =>
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph(doc.person?.fullName || "Person not found"),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph(
                      doc.relationship1to2Desc || "Relationship not found"
                    ),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph(
                      doc.relationship2to1Desc || "Relationship not found"
                    ),
                  ],
                }),
                new TableCell({
                  children: [new Paragraph(doc.dateStart || "Date not found")],
                }),
                new TableCell({
                  children: [new Paragraph(doc.dateEnd || "Date not found")],
                }),
                new TableCell({
                  children: [
                    new Paragraph(doc.dateEndCause || "Date not found"),
                  ],
                }),
              ],
            })
        ),
      ],
    });

    const doc = new Document({
      sections: [{ children: [table] }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "table.docx");
    });
  };

  // Load filters from session storage when component mounts
  // Load filters and global filter from session storage when component mounts
  useEffect(() => {
    const savedFilters = sessionStorage.getItem("relationships-table-filters");
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }

    const savedGlobalFilter = sessionStorage.getItem(
      "relationships-table-globalFilter"
    );
    if (savedGlobalFilter) {
      setGlobalFilter(savedGlobalFilter);
    }
  }, []);

  // Save filters to session storage whenever they are updated
  const onFilter = (e) => {
    setFilters(e.filters); // Update state
    sessionStorage.setItem(
      "relationships-table-filters",
      JSON.stringify(e.filters)
    ); // Save to sessionStorage
  };

  // Save global filter value to session storage when it changes
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;

    setGlobalFilter(value); // Apply the filter
    sessionStorage.setItem("relationships-table-globalFilter", value); // Save the filter to sessionStorage
  };

  // Function to render header with global search and export buttons
  const renderHeader = () => {
    const leftContents = (
      <span className="p-input-icon-left">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search"> </InputIcon>
          <InputText
            type="search"
            value={globalFilter} // Ensure global filter input shows the correct value
            onChange={onGlobalFilterChange} // Update on change
            placeholder="Global Search"
          />
        </IconField>
      </span>
    );

    const rightContents = (
      <>
        <Button
          label="Download PDF"
          icon="pi pi-file-pdf"
          onClick={downloadPDF}
          className="p-button-danger"
          style={{ width: "150px", marginRight: "8px" }}
        />
        <Button
          label="Download Excel"
          icon="pi pi-file-excel"
          onClick={downloadExcel}
          className="p-button-success"
          style={{ width: "150px", marginRight: "8px" }}
        />
        <Button
          label="Download Word"
          icon="pi pi-file-word"
          onClick={downloadWord}
          className="p-button-primary"
          style={{ width: "150px", marginRight: "8px" }}
        />
      </>
    );

    return <Toolbar left={leftContents} right={rightContents} />;
  };
  const header = renderHeader();

  return nodeData.relations ? (
    <div>
      <DataTable
        ref={dt}
        value={relationships}
        paginator
        rows={10}
        responsiveLayout="scroll"
        globalFilter={globalFilter}
        filters={filters} // Set filters from state
        header={header}
        onRowClick={handleItemClick}
        stateStorage="session" // Saves state to sessionStorage
        stateKey="relationships-table-state" // Unique key for this table's state
        className="custom-datatable"
        onFilter={onFilter} // Set the onFilter callback
        onValueChange={(filteredData) => setFilteredData(filteredData)} // Update filtered data state
      >
        <Column
          field="person.fullName"
          header="Name"
          sortable
          filter
          filterPlaceholder="Search"
        ></Column>
        <Column
          field="relationship1to2Desc"
          header="Relationship"
          sortable
          filter
          filterPlaceholder="Search"
        ></Column>
        <Column
          field="relationship2to1Desc"
          header="Relationship2"
          sortable
          filter
          filterPlaceholder="Search"
        ></Column>
        <Column
          field="dateStart"
          header="Started"
          sortable
          filter
          filterPlaceholder="Search"
        ></Column>
        <Column
          field="dateEnd"
          header="Ended"
          sortable
          filter
          filterPlaceholder="Search"
        ></Column>
        <Column
          field="dateEndCause"
          header="End reason"
          sortable
          filter
          filterPlaceholder="Search"
        ></Column>
      </DataTable>
    </div>
  ) : (
    <p>No relations is available for {nodeData.data.person.fullName} yet.</p>
  );
};

export default Relationships;