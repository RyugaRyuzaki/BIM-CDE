// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from "flatbuffers";

import {StreamedGeometry} from "../streamed-geometries/streamed-geometry";

export class StreamedGeometries {
  bb: flatbuffers.ByteBuffer | null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): StreamedGeometries {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsStreamedGeometries(
    bb: flatbuffers.ByteBuffer,
    obj?: StreamedGeometries
  ): StreamedGeometries {
    return (obj || new StreamedGeometries()).__init(
      bb.readInt32(bb.position()) + bb.position(),
      bb
    );
  }

  static getSizePrefixedRootAsStreamedGeometries(
    bb: flatbuffers.ByteBuffer,
    obj?: StreamedGeometries
  ): StreamedGeometries {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new StreamedGeometries()).__init(
      bb.readInt32(bb.position()) + bb.position(),
      bb
    );
  }

  geometries(index: number, obj?: StreamedGeometry): StreamedGeometry | null {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset
      ? (obj || new StreamedGeometry()).__init(
          this.bb!.__indirect(
            this.bb!.__vector(this.bb_pos + offset) + index * 4
          ),
          this.bb!
        )
      : null;
  }

  geometriesLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  static startStreamedGeometries(builder: flatbuffers.Builder) {
    builder.startObject(1);
  }

  static addGeometries(
    builder: flatbuffers.Builder,
    geometriesOffset: flatbuffers.Offset
  ) {
    builder.addFieldOffset(0, geometriesOffset, 0);
  }

  static createGeometriesVector(
    builder: flatbuffers.Builder,
    data: flatbuffers.Offset[]
  ): flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addOffset(data[i]!);
    }
    return builder.endVector();
  }

  static startGeometriesVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static endStreamedGeometries(
    builder: flatbuffers.Builder
  ): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static finishStreamedGeometriesBuffer(
    builder: flatbuffers.Builder,
    offset: flatbuffers.Offset
  ) {
    builder.finish(offset);
  }

  static finishSizePrefixedStreamedGeometriesBuffer(
    builder: flatbuffers.Builder,
    offset: flatbuffers.Offset
  ) {
    builder.finish(offset, undefined, true);
  }

  static createStreamedGeometries(
    builder: flatbuffers.Builder,
    geometriesOffset: flatbuffers.Offset
  ): flatbuffers.Offset {
    StreamedGeometries.startStreamedGeometries(builder);
    StreamedGeometries.addGeometries(builder, geometriesOffset);
    return StreamedGeometries.endStreamedGeometries(builder);
  }
}
